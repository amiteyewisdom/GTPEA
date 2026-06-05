import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STAGE_ROLE_MAP: Record<number, string> = {
  1: "union_rep",
  2: "fund_manager",
  3: "chairperson",
};

export async function POST(request: Request) {
  const body = await request.json();
  const approvalId = String(body?.approval_id || "");
  const action = String(body?.action || "");
  const notes = String(body?.notes || "");

  if (!approvalId) {
    return NextResponse.json({ error: "Approval ID is required." }, { status: 400 });
  }

  if (!['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: "Action must be either approved or rejected." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profileRes = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
  const role = profileRes.data?.role ?? "union_rep";

  const approvalRes = await supabase
    .from("approvals")
    .select("id, status, current_stage, total_stages")
    .eq("id", approvalId)
    .single();

  if (approvalRes.error || !approvalRes.data) {
    return NextResponse.json({ error: "Approval record not found." }, { status: 404 });
  }

  const approval = approvalRes.data as {
    id: string;
    status: string;
    current_stage: number;
    total_stages: number;
  };

  if (approval.status !== "pending") {
    return NextResponse.json({ error: "Only pending approvals can be actioned." }, { status: 400 });
  }

  const stage = approval.current_stage;
  const nextStage = stage < approval.total_stages ? stage + 1 : approval.total_stages;
  const isFinalStage = stage >= approval.total_stages;

  const updates: Record<string, unknown> = {
    current_stage: action === "approved" && !isFinalStage ? nextStage : approval.current_stage,
  };

  if (action === "approved" && isFinalStage) {
    updates.status = "approved";
    updates.completed_at = new Date().toISOString();
    updates.final_reviewer = user.id;
    updates.final_notes = notes || null;
  }

  if (action === "rejected") {
    updates.status = "rejected";
    updates.completed_at = new Date().toISOString();
    updates.final_reviewer = user.id;
    updates.final_notes = notes || null;
  }

  const actionPayload = {
    approval_id: approvalId,
    stage,
    required_role: STAGE_ROLE_MAP[stage] ?? role,
    action: action as "approved" | "rejected",
    actioned_by: user.id,
    notes: notes || null,
  };

  const { error: actionError } = await supabase.from("approval_actions").insert([actionPayload]);
  if (actionError) {
    return NextResponse.json({ error: actionError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase.from("approvals").update(updates).eq("id", approvalId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Action completed." });
}
