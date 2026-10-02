// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const withdrawalId = String(body?.withdrawal_id);

  if (!withdrawalId) {
    return NextResponse.json({ error: "Withdrawal ID is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Only the fund manager (or admins) can pay out a withdrawal —
  // money is handed over manually, this marks it as paid.
  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single() as any;

  if (!["fund_manager", "administrator", "super_admin"].includes(actorProfile?.role ?? "")) {
    return NextResponse.json({ error: "Only the Fund Manager can disburse withdrawals." }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: withdrawal, error: withdrawalError } = await admin
    .from("withdrawal_requests")
    .select("id, request_ref, amount, savings_id, employee_id, status")
    .eq("id", withdrawalId)
    .single() as any;

  if (withdrawalError || !withdrawal) {
    return NextResponse.json({ error: "Withdrawal request not found." }, { status: 404 });
  }

  // Only approved requests can be disbursed — 'pending' still needs approval,
  // 'disbursed' has already been paid out.
  if (withdrawal.status !== "approved") {
    return NextResponse.json(
      { error: withdrawal.status === "disbursed" ? "This withdrawal has already been paid out." : "Withdrawal must be approved before disbursement." },
      { status: 400 }
    );
  }

  const amount = Number(withdrawal.amount) || 0;

  // Re-check the savings balance at payout time — it may have changed
  // since the request was approved.
  const { data: savings, error: savingsError } = await admin
    .from("savings")
    .select("id, balance")
    .eq("id", withdrawal.savings_id)
    .single() as any;

  if (savingsError || !savings) {
    return NextResponse.json({ error: "Savings account not found." }, { status: 404 });
  }

  const currentBalance = Number(savings.balance) || 0;
  if (currentBalance < amount) {
    return NextResponse.json(
      { error: `Insufficient savings balance (${currentBalance}) to pay out ${amount}.` },
      { status: 400 }
    );
  }

  const newBalance = currentBalance - amount;

  const { error: balanceError } = await admin
    .from("savings")
    .update({ balance: newBalance })
    .eq("id", savings.id) as any;

  if (balanceError) {
    return NextResponse.json({ error: `Failed to update savings balance: ${balanceError.message}` }, { status: 500 });
  }

  const { data: updatedWithdrawal, error: updateError } = await admin
    .from("withdrawal_requests")
    .update({
      status: "disbursed",
      disbursement_date: new Date().toISOString().split("T")[0],
      disbursed_by: user.id,
    })
    .eq("id", withdrawalId)
    .select()
    .single() as any;

  if (updateError || !updatedWithdrawal) {
    // Balance was already deducted — surface the failure loudly.
    return NextResponse.json(
      { error: updateError?.message || "Failed to mark withdrawal as disbursed." },
      { status: 500 }
    );
  }

  // Record the withdrawal transaction
  const { error: transactionError } = await admin
    .from("transactions")
    .insert([
      {
        type: "savings_withdrawal",
        amount,
        employee_id: withdrawal.employee_id,
        reference: withdrawal.request_ref,
        description: `Savings withdrawal ${withdrawal.request_ref} paid out`,
        balance_before: currentBalance,
        balance_after: newBalance,
        related_id: withdrawal.id,
        related_type: "withdrawal_request",
        performed_by: user.id,
      },
    ] as any);

  if (transactionError) {
    console.error("Failed to create withdrawal transaction record:", transactionError);
  }

  // Notify the employee their savings were paid out
  try {
    const { data: applicantProfile } = await admin
      .from("profiles")
      .select("user_id")
      .eq("employee_id", withdrawal.employee_id)
      .maybeSingle();
    if (applicantProfile?.user_id) {
      await admin.from("notifications").insert({
        user_id: applicantProfile.user_id,
        type: "withdrawal_disbursed",
        title: "Withdrawal Paid Out",
        message: `Withdrawal ${withdrawal.request_ref} has been disbursed. GH₵${amount.toLocaleString()} was deducted from your savings.`,
        entity_type: "withdrawal",
        entity_id: withdrawal.id,
      });
    }
  } catch (notifErr) {
    console.error("Failed to send withdrawal disbursement notification:", notifErr);
  }

  return NextResponse.json({ message: "Withdrawal disbursed successfully", withdrawal: updatedWithdrawal });
}
