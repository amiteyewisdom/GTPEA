// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReference } from "@/utils/formatters";
import { getLoggedInEmployee } from "@/lib/loans/employee";

export async function POST(request: Request) {
  const body = await request.json();
  const savingsId = String(body?.savings_id || "");
  const amount = Number(body?.amount);
  const reason = String(body?.reason || "");

  if (!savingsId) {
    return NextResponse.json({ error: "Savings account ID is required." }, { status: 400 });
  }

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const employee = await getLoggedInEmployee(supabase);

  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  // Get savings account and check balance using admin client
  const { data: savings, error: savingsError } = await admin
    .from("savings")
    .select("id, balance, status, employee_id")
    .eq("id", savingsId)
    .single();

  if (savingsError || !savings) {
    return NextResponse.json({ error: "Savings account not found." }, { status: 404 });
  }

  if (savings.status !== "active") {
    return NextResponse.json({ error: "Savings account is not active." }, { status: 400 });
  }

  // Verify the savings account belongs to the employee
  if (savings.employee_id !== employee.employeeId) {
    return NextResponse.json({ error: "Savings account does not belong to you." }, { status: 403 });
  }

  if (amount > Number(savings.balance)) {
    return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });
  }

  // Create withdrawal request
  const requestRef = generateReference("WDR");

  const { data: withdrawal, error: withdrawalError } = await admin
    .from("withdrawal_requests")
    .insert([
      {
        request_ref: requestRef,
        employee_id: employee.employeeId,
        savings_id: savingsId,
        amount: amount,
        reason: reason || null,
        status: "pending",
        requested_at: new Date().toISOString(),
      },
    ] as any)
    .select()
    .single() as any;

  if (withdrawalError || !withdrawal) {
    return NextResponse.json({ error: withdrawalError?.message || "Failed to create withdrawal request." }, { status: 500 });
  }

  // Create approval workflow - withdrawals go directly to Fund Manager (single stage)
  const { error: approvalError } = await admin
    .from("approvals")
    .insert([
      {
        entity_type: "withdrawal",
        entity_id: withdrawal.id,
        status: "pending",
        current_stage: 1,
        total_stages: 1,
        submitted_by: employee.userId,
      },
    ] as any) as any;

  if (approvalError) {
    return NextResponse.json({ error: approvalError.message || "Failed to create approval workflow." }, { status: 500 });
  }

  // Notify fund managers that a withdrawal needs their review
  try {
    const fmRes = await (admin.from("profiles") as any).select("user_id").eq("role", "fund_manager");
    for (const fm of (fmRes.data ?? []) as { user_id: string }[]) {
      await (admin.from("notifications") as any).insert({
        user_id: fm.user_id,
        type: "approval_required",
        title: "Withdrawal needs your review",
        message: `A savings withdrawal request (${requestRef}) needs your approval.`,
        entity_type: "withdrawal",
        entity_id: withdrawal.id,
      });
    }
  } catch (notifErr) {
    console.warn("[withdrawals/request] fund-manager notification failed (non-fatal):", notifErr);
  }

  return NextResponse.json({
    message: "Withdrawal request submitted. The approval and administrative process will take a maximum of 2 weeks.",
    withdrawal,
  });
}
