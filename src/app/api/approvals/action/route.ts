import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processApprovalAction } from "@/lib/approvals/process-action";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const approvalId = String(body?.approval_id || "");
    const action = String(body?.action || "");
    const notes = String(body?.notes || "").trim();

    if (!approvalId) {
      return NextResponse.json({ error: "Approval ID is required." }, { status: 400 });
    }

    if (action !== "approved" && action !== "rejected") {
      return NextResponse.json({ error: "Action must be approved or rejected." }, { status: 400 });
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
      .eq("id", approvalId)
      .single();

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
      return NextResponse.json({ error: "Approval not found." }, { status: 404 });
    }

    const result = await processApprovalAction({
      approval,
      action,
      notes,
      userId: user.id,
      userRole: role,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
    }

    return NextResponse.json({ message: result.message });
  } catch (err) {
    console.error("[POST /api/approvals/action] Unexpected error:", err);
    const details = err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : String(err);
    return NextResponse.json({ error: "Server error", details }, { status: 500 });
  }
}
