import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processApprovalAction } from "@/lib/approvals/process-action";

export async function POST(request: Request) {
  const body = await request.json();
  const loanId = String(body?.loan_id || "");
  const action = String(body?.action || "");
  const notes = String(body?.notes || "").trim();

  if (!loanId) {
    return NextResponse.json({ error: "Loan ID is required." }, { status: 400 });
  }

  if (!["approved", "rejected", "on_hold"].includes(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profileRes = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = (profileRes.data as { role: string } | null)?.role;
  if (!role) {
    return NextResponse.json({ error: "User profile not found." }, { status: 404 });
  }

  const approvalRes = await supabase
    .from("approvals")
    .select("id, entity_type, entity_id, status, current_stage, total_stages, submitted_by")
    .eq("entity_type", "loan")
    .eq("entity_id", loanId)
    .eq("status", "pending")
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const approval = approvalRes.data as {
    id: string;
    entity_type: string;
    entity_id: string;
    status: string;
    current_stage: number;
    total_stages: number;
    submitted_by: string;
  } | null;

  if (approvalRes.error || !approval) {
    return NextResponse.json({ error: "No pending approval found for this loan." }, { status: 404 });
  }

  const mappedAction = action === "on_hold" ? "rejected" : (action as "approved" | "rejected");

  const result = await processApprovalAction({
    approval,
    action: mappedAction,
    notes,
    userId: user.id,
    userRole: role,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }

  return NextResponse.json({ message: result.message });
}
