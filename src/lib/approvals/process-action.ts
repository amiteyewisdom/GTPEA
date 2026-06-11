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

  const actionRes = await (admin.from("approval_actions") as any).insert({
    approval_id: approval.id,
    stage: approval.current_stage,
    required_role: roleForStage(approval.current_stage) ?? userRole,
    action,
    actioned_by: userId,
    notes: notes || null,
  });

  if (actionRes.error) {
    return { error: actionRes.error.message, status: 500 };
  }

  const approvalUpdates: Record<string, unknown> = {
    current_stage: action === "approved" && !isFinalStage ? nextStage : approval.current_stage,
  };

  if (action === "rejected") {
    approvalUpdates.status = "rejected";
    approvalUpdates.completed_at = new Date().toISOString();
    approvalUpdates.final_reviewer = userId;
    approvalUpdates.final_notes = notes || null;
  } else if (action === "approved" && isFinalStage) {
    approvalUpdates.status = "approved";
    approvalUpdates.completed_at = new Date().toISOString();
    approvalUpdates.final_reviewer = userId;
    approvalUpdates.final_notes = notes || null;
  }

  const updateRes = await (admin.from("approvals") as any).update(approvalUpdates).eq("id", approval.id);
  if (updateRes.error) {
    return { error: updateRes.error.message, status: 500 };
  }

  if (approval.entity_type === "loan") {
    if (action === "rejected") {
      await (admin.from("loans") as any).update({ status: "rejected" }).eq("id", approval.entity_id);
    } else if (action === "approved" && isFinalStage) {
      const loanRes = await (admin.from("loans") as any)
        .select("amount_requested")
        .eq("id", approval.entity_id)
        .single();

      await (admin.from("loans") as any)
        .update({
          status: "approved",
          approved_by: userId,
          amount_approved: loanRes.data?.amount_requested ?? null,
        })
        .eq("id", approval.entity_id);
    }
  }

  const entityLabel = approval.entity_type === "loan" ? "Loan application" : "Request";

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

  return {
    message: successMessageAfterApproval(action, approval.current_stage, isFinalStage),
    status: 200,
    is_final: isFinalStage && action === "approved",
    next_stage: action === "approved" && !isFinalStage ? nextStage : null,
    next_reviewer: action === "approved" && !isFinalStage ? roleForStage(nextStage) : null,
  };
}
