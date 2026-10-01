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
  reasonCode?: string;
  userId: string;
  userRole: string;
}) {
  const { approval, action, notes, reasonCode, userId, userRole } = input;

  if (approval.status !== "pending") {
    return { error: "This approval is already completed.", status: 400 };
  }

  if (!canApproveAtStage(userRole, approval.current_stage, approval.entity_type)) {
    const needed = roleForStage(approval.current_stage, approval.entity_type) ?? "approver";
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
    const actionData: any = {
      approval_id: approval.id,
      stage: approval.current_stage,
      required_role: roleForStage(approval.current_stage, approval.entity_type) ?? userRole,
      action,
      actioned_by: userId,
      notes: notes || null,
    };

    // Only include reason_code if the column exists in the database
    // This handles cases where the database schema hasn't been migrated
    try {
      const { data: columnCheck } = await admin
        .from("approval_actions")
        .select("reason_code")
        .limit(1)
        .single();

      if (columnCheck !== null && 'reason_code' in columnCheck) {
        actionData.reason_code = reasonCode || null;
      }
    } catch (error) {
      // Column doesn't exist, skip adding reason_code
      console.log("[processApprovalAction] reason_code column doesn't exist, skipping");
    }

    const actionRes = await (admin.from("approval_actions") as any).insert(actionData);

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
      // Update loan status and store rejection reason
      const loanUpdateData: any = {
        status: "rejected",
      };

      // Try to use rejection_reason_code if it exists, otherwise use notes
      try {
        const { data: columnCheck } = await admin
          .from("loans")
          .select("rejection_reason_code")
          .limit(1)
          .single();

        if (columnCheck !== null && 'rejection_reason_code' in columnCheck) {
          loanUpdateData.rejection_reason_code = reasonCode || notes || "Loan rejected";
        } else {
          // Fallback to notes field
          loanUpdateData.notes = reasonCode || notes || "Loan rejected";
        }
      } catch (error) {
        // Column doesn't exist, use notes
        loanUpdateData.notes = reasonCode || notes || "Loan rejected";
      }

      const loanRes = await (admin.from("loans") as any)
        .update(loanUpdateData)
        .eq("id", approval.entity_id);
      if (loanRes.error) {
        console.error("[processApprovalAction] loans update error:", loanRes.error);
        return { error: `Rejection recorded, but updating the loan failed: ${loanRes.error.message}`, status: 500 };
      }
    } else if (action === "approved" && isFinalStage) {
      const loanRes = await (admin.from("loans") as any)
        .select("amount_requested")
        .eq("id", approval.entity_id)
        .single();

      // Final board approval = 'approved' (ready to disburse). The loan only
      // counts as money out / owed once the fund manager disburses it —
      // disbursement is manual, the system records it afterwards.
      // NB: loans has approved_by but no approved_at column.
      const loanUpdateRes = await (admin.from("loans") as any)
        .update({
          status: "approved",
          approved_by: userId,
          amount_approved: loanRes.data?.amount_requested ?? null,
        })
        .eq("id", approval.entity_id);
      if (loanUpdateRes.error) {
        console.error("[processApprovalAction] loans update error:", loanUpdateRes.error);
        return { error: `Approval recorded, but updating the loan failed: ${loanUpdateRes.error.message}`, status: 500 };
      }

      // Notify fund managers that a loan is ready to disburse
      try {
        const fmRes = await (admin.from("profiles") as any).select("user_id").eq("role", "fund_manager");
        for (const fm of (fmRes.data ?? []) as { user_id: string }[]) {
          await (admin.from("notifications") as any).insert({
            user_id: fm.user_id,
            type: "approval_required",
            title: "Loan ready to disburse",
            message: `Loan application fully approved and ready for disbursement.`,
            entity_type: "loan",
            entity_id: approval.entity_id,
          });
        }
      } catch (fmErr) {
        console.warn("[processApprovalAction] fund-manager notification failed (non-fatal):", fmErr);
      }
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
      const wRes = await (admin.from("withdrawal_requests") as any)
        .update({ 
          status: "rejected",
          notes: reasonCode || notes || "Withdrawal rejected"
        })
        .eq("id", withdrawal.id);
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
          ? `${entityLabel} moved to stage ${nextStage} (${labelForRole(roleForStage(nextStage, approval.entity_type) ?? "next reviewer")}).`
          : action === "approved" && isFinalStage
            ? `${entityLabel} fully approved.`
            : `${entityLabel} was rejected${reasonCode || notes ? ` — ${reasonCode || notes}` : ""}. You can amend the application and resubmit it.`,
      entity_type: approval.entity_type,
      entity_id: approval.entity_id,
    });

    if (action === "approved" && !isFinalStage) {
      const nextRole = roleForStage(nextStage, approval.entity_type);
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
    message: successMessageAfterApproval(action, approval.current_stage, isFinalStage, approval.entity_type),
    status: 200,
    is_final: isFinalStage && action === "approved",
    next_stage: action === "approved" && !isFinalStage ? nextStage : null,
    next_reviewer: action === "approved" && !isFinalStage ? roleForStage(nextStage, approval.entity_type) : null,
  };
}
