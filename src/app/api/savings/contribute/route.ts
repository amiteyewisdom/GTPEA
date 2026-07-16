// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReference } from "@/utils/formatters";

export async function POST(request: Request) {
  const body = await request.json();
  const savingsId = String(body?.savings_id || "");
  const amount = Number(body?.amount);

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

  // Get savings account
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

  // Create savings contribution
  const contributionRef = generateReference("CONTRIB");
  const contributionDate = new Date();

  const { data: contribution, error: contributionError } = await supabase
    .from("savings_contributions")
    .insert([
      {
        contribution_ref: contributionRef,
        savings_id: savingsId,
        employee_id: savings.employee_id,
        amount: amount,
        contribution_date: contributionDate.toISOString(),
        period_year: contributionDate.getUTCFullYear(),
        period_month: contributionDate.getUTCMonth() + 1,
        source: "manual",
        notes: null,
      },
    ] as any)
    .select()
    .single() as any;

  if (contributionError || !contribution) {
    return NextResponse.json({ error: contributionError?.message || "Failed to create contribution." }, { status: 500 });
  }

  // Update savings balance
  const newBalance = Number(savings.balance) + amount;

  const { error: updateError } = await supabase
    .from("savings")
    .update({ balance: newBalance })
    .eq("id", savingsId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message || "Failed to update balance." }, { status: 500 });
  }

  // Create transaction record
  const transactionRef = generateReference("TXN");

  const { error: transactionError } = await supabase
    .from("transactions")
    .insert([
      {
        reference: transactionRef,
        employee_id: savings.employee_id,
        type: "savings_deposit",
        amount: amount,
        balance_before: Number(savings.balance),
        balance_after: newBalance,
        description: "Manual savings contribution",
        related_id: contribution.id,
        related_type: "savings_contribution",
      },
    ] as any) as any;

  if (transactionError) {
    return NextResponse.json({ error: transactionError.message || "Failed to create transaction record." }, { status: 500 });
  }

  return NextResponse.json({ 
    message: "Contribution added successfully", 
    contribution,
    newBalance 
  });
}
