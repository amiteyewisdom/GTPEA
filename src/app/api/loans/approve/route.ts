// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const loanId = String(body?.loan_id || "");
  const action = String(body?.action || ""); // 'approved', 'rejected', 'on_hold'
  const notes = String(body?.notes || "");

  if (!loanId) {
    return NextResponse.json({ error: "Loan ID is required." }, { status: 400 });
  }

  if (!["approved", "rejected", "on_hold"].includes(action)) {
    return NextResponse.json({ error: "Invalid action. Must be approved, rejected, or on_hold." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Get user's role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User profile not found." }, { status: 404 });
  }

  const userRole = profile.role;

  // Get the loan and its approval workflow
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select(`
      *,
      approvals (
        id,
        current_stage,
        total_stages,
        status
      )
    `)
    .eq("id", loanId)
    .single();

  if (loanError || !loan) {
    return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  }

  const approval = loan.approvals?.[0];

  if (!approval) {
    return NextResponse.json({ error: "Approval workflow not found for this loan." }, { status: 404 });
  }

  if (approval.status !== "pending") {
    return NextResponse.json({ error: "Loan is not in pending status." }, { status: 400 });
  }

  // Determine required role for current stage
  const stageRoles = ["union_rep", "fund_manager", "chairperson"];
  const requiredRole = stageRoles[approval.current_stage - 1];

  if (userRole !== requiredRole && userRole !== "super_admin" && userRole !== "administrator") {
    return NextResponse.json({ 
      error: `You don't have permission to approve loans at this stage. Required role: ${requiredRole}` 
    }, { status: 403 });
  }

  // Record the approval action
  const { error: actionError } = await supabase
    .from("approval_actions")
    .insert({
      approval_id: approval.id,
      stage: approval.current_stage,
      required_role: requiredRole,
      action: action,
      actioned_by: user.id,
      notes: notes || null,
    });

  if (actionError) {
    return NextResponse.json({ error: actionError.message || "Failed to record approval action." }, { status: 500 });
  }

  // Update approval workflow status
  let newApprovalStatus = approval.status;
  let newCurrentStage = approval.current_stage;

  if (action === "rejected") {
    newApprovalStatus = "rejected";
  } else if (action === "on_hold") {
    newApprovalStatus = "on_hold";
  } else if (action === "approved") {
    // Move to next stage or complete
    if (approval.current_stage >= approval.total_stages) {
      newApprovalStatus = "approved";
      // Update loan status to approved
      await supabase
        .from("loans")
        .update({ 
          status: "approved",
          approved_by: user.id,
          amount_approved: loan.amount_requested
        })
        .eq("id", loanId);
    } else {
      newCurrentStage = approval.current_stage + 1;
    }
  }

  const { error: updateError } = await supabase
    .from("approvals")
    .update({
      status: newApprovalStatus,
      current_stage: newCurrentStage,
      completed_at: newApprovalStatus !== "pending" ? new Date().toISOString() : null,
      final_notes: newApprovalStatus !== "pending" ? notes : null,
    })
    .eq("id", approval.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message || "Failed to update approval status." }, { status: 500 });
  }

  // If rejected, update loan status
  if (action === "rejected") {
    await supabase
      .from("loans")
      .update({ status: "rejected" })
      .eq("id", loanId);
  }

  return NextResponse.json({ 
    message: `Loan ${action} successfully`,
    approvalStatus: newApprovalStatus,
    currentStage: newCurrentStage
  });
}
