import { createAdminClient } from "@/lib/supabase/admin";
import {
  canApproveAtStage,
  labelForRole,
  roleForStage,
  successMessageAfterApproval,
} from "@/lib/loans/workflow";


type ApprovalRecord = {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  current_stage: number;
  total_stages: number;
  submitted_by: string;
};

export async function processApprovalAction(input: {
  approval: ApprovalRecord;
  action: "approved" | "rejected";
  notes: string;
  userId: string;
  userRole: string;
}) {
  const { approval, action, notes, userId, userRole } = input;

  if (approval.status !== "pending") {
    return { error: "This approval is already completed.", status: 400 };
  }

  if (!canApproveAtStage(userRole, approval.current_stage)) {
    const needed = roleForStage(approval.current_stage) ?? "approver";
    return { error: `This step needs a ${needed.replace("_", " ")}.`, status: 403 };
  }

  const isFinalStage = approval.current_stage >= approval.total_stages;
  const nextStage = isFinalStage ? approval.current_stage : approval.current_stage + 1;
  const admin = createAdminClient();

  const existingRes = await (admin.from("approval_actions") as any)
    .select("id")
    .eq("approval_id", approval.id)
    .eq("stage", approval.current_stage)
    .maybeSingle();

  if (existingRes.error) {
    console.error("[processApprovalAction] check existing action error:", existingRes.error);
  }

  const alreadyActioned = !!existingRes.data;

  if (!alreadyActioned) {
    const actionRes = await (admin.from("approval_actions") as any).insert({
      approval_id: approval.id,
      stage: approval.current_stage,
      required_role: roleForStage(approval.current_stage) ?? userRole,
      action,
      actioned_by: userId,
      notes: notes || null,
    });

    if (actionRes.error) {
      console.error("[processApprovalAction] approval_actions insert error:", actionRes.error);
      return { error: actionRes.error.message, status: 500 };
    }
  }

  const approvalUpdates: Record<string, unknown> = {
    current_stage: action === "approved" && !isFinalStage ? nextStage : approval.current_stage,
  };

  if (action === "rejected") {
    approvalUpdates.status = "rejected";
    approvalUpdates.completed_at = new Date().toISOString();
  } else if (action === "approved" && isFinalStage) {
    approvalUpdates.status = "approved";
    approvalUpdates.completed_at = new Date().toISOString();
  }

  console.log("[processApprovalAction] updating approval:", approval.id, "with:", approvalUpdates);
  const updateRes = await (admin.from("approvals") as any).update(approvalUpdates).eq("id", approval.id);
  if (updateRes.error) {
    console.error("[processApprovalAction] approvals update error:", updateRes.error);
    return { error: updateRes.error.message, status: 500 };
  }
  console.log("[processApprovalAction] approval updated successfully");

  if (approval.entity_type === "loan") {
    if (action === "rejected") {
      const loanRes = await (admin.from("loans") as any).update({ status: "rejected" }).eq("id", approval.entity_id);
      if (loanRes.error) console.error("[processApprovalAction] loans update error:", loanRes.error);
    } else if (action === "approved" && isFinalStage) {
      const loanRes = await (admin.from("loans") as any)
        .select("amount_requested")
        .eq("id", approval.entity_id)
        .single();

      const loanUpdateRes = await (admin.from("loans") as any)
        .update({
          status: "approved",
          approved_by: userId,
          approved_at: new Date().toISOString(),
          amount_approved: loanRes.data?.amount_requested ?? null,
          outstanding_balance: loanRes.data?.amount_requested ?? 0,
        })
        .eq("id", approval.entity_id);
      if (loanUpdateRes.error) console.error("[processApprovalAction] loans update error:", loanUpdateRes.error);
    }
  }

  if (approval.entity_type === "withdrawal") {
    const withdrawalRes = await (admin.from("withdrawal_requests") as any)
      .select("id, amount, savings_id, employee_id, status")
      .eq("id", approval.entity_id)
      .single();
    const withdrawal = withdrawalRes.data;
    if (!withdrawal || withdrawalRes.error) {
      console.error("[processApprovalAction] withdrawal fetch error:", withdrawalRes.error);
    } else if (action === "rejected") {
      const wRes = await (admin.from("withdrawal_requests") as any).update({ status: "rejected" }).eq("id", withdrawal.id);
      if (wRes.error) console.error("[processApprovalAction] withdrawal update error:", wRes.error);
    } else if (action === "approved" && isFinalStage) {
      // Deduct from savings balance on final approval
      const savingsRes = await (admin.from("savings") as any)
        .select("id, balance")
        .eq("id", withdrawal.savings_id)
        .single();
      const savings = savingsRes.data;
      const amount = Number(withdrawal.amount) || 0;
      if (savings && amount > 0) {
        const currentBalance = Number(savings.balance) || 0;
        if (currentBalance >= amount) {
          const newBalance = currentBalance - amount;
          const balanceUpdateRes = await (admin.from("savings") as any)
            .update({ balance: newBalance })
            .eq("id", savings.id);
          if (balanceUpdateRes.error) console.error("[processApprovalAction] savings balance update error:", balanceUpdateRes.error);

          // Record withdrawal transaction
          await (admin.from("transactions") as any).insert({
            reference: `WDR-${Date.now()}`,
            employee_id: withdrawal.employee_id,
            type: "savings_withdrawal",
            amount: amount,
            balance_before: currentBalance,
            balance_after: newBalance,
            description: "Approved savings withdrawal",
            related_id: withdrawal.id,
            related_type: "withdrawal_request",
            performed_by: userId,
          });
        } else {
          console.error("[processApprovalAction] insufficient savings balance for withdrawal", withdrawal.id);
        }
      }
      const wRes = await (admin.from("withdrawal_requests") as any)
        .update({ status: "disbursed", disbursed_at: new Date().toISOString() })
        .eq("id", withdrawal.id);
      if (wRes.error) console.error("[processApprovalAction] withdrawal status update error:", wRes.error);
    }
  }

  const entityLabel = approval.entity_type === "loan" ? "Loan application" : approval.entity_type === "withdrawal" ? "Withdrawal" : "Request";

  try {
    await (admin.from("notifications") as any).insert({
      user_id: approval.submitted_by,
      type: action === "approved" ? "approval_completed" : "approval_rejected",
      title: `${entityLabel} ${action === "approved" ? "approved" : "rejected"}`,
      message:
        action === "approved" && !isFinalStage
          ? `${entityLabel} moved to stage ${nextStage} (${labelForRole(roleForStage(nextStage) ?? "next reviewer")}).`
          : action === "approved" && isFinalStage
            ? `${entityLabel} fully approved.`
            : `${entityLabel} was rejected.`,
      entity_type: approval.entity_type,
      entity_id: approval.entity_id,
    });

    if (action === "approved" && !isFinalStage) {
      const nextRole = roleForStage(nextStage);
      if (nextRole) {
        const approversRes = await (admin.from("profiles") as any).select("user_id").eq("role", nextRole);
        for (const approver of (approversRes.data ?? []) as { user_id: string }[]) {
          await (admin.from("notifications") as any).insert({
            user_id: approver.user_id,
            type: "approval_required",
            title: `${entityLabel} needs your review`,
            message: `A ${entityLabel.toLowerCase()} needs your review at stage ${nextStage}.`,
            entity_type: approval.entity_type,
            entity_id: approval.entity_id,
          });
        }
      }
    }
  } catch (notifErr) {
    console.warn("[processApprovalAction] notification insert failed (non-fatal):", notifErr);
  }

  return {
    message: successMessageAfterApproval(action, approval.current_stage, isFinalStage),
    status: 200,
    is_final: isFinalStage && action === "approved",
    next_stage: action === "approved" && !isFinalStage ? nextStage : null,
    next_reviewer: action === "approved" && !isFinalStage ? roleForStage(nextStage) : null,
  };
}
