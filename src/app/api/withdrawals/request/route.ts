// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReference } from "@/utils/formatters";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Get employee ID from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User profile not found." }, { status: 404 });
  }

  // Get savings account and check balance
  const { data: savings, error: savingsError } = await supabase
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

  if (amount > Number(savings.balance)) {
    return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });
  }

  // Create withdrawal request
  const requestRef = generateReference("WDR");

  const { data: withdrawal, error: withdrawalError } = await supabase
    .from("withdrawal_requests")
    .insert([
      {
        request_ref: requestRef,
        employee_id: savings.employee_id,
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

  // Create approval workflow
  const { error: approvalError } = await supabase
    .from("approvals")
    .insert([
      {
        entity_type: "withdrawal",
        entity_id: withdrawal.id,
        status: "pending",
        current_stage: 1,
        total_stages: 3,
        submitted_by: user.id,
      },
    ] as any) as any;

  if (approvalError) {
    return NextResponse.json({ error: approvalError.message || "Failed to create approval workflow." }, { status: 500 });
  }

  return NextResponse.json({ message: "Withdrawal request submitted successfully.", withdrawal });
}
