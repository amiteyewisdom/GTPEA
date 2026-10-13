// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReference } from "@/utils/formatters";
import { getOrCreateNextRepaymentInstallment } from "@/lib/loans/repayment-schedule";

export async function POST(request: Request) {
  const body = await request.json();
  const loanId = String(body?.loan_id || "");
  const amount = Number(body?.amount);
  const paymentMethod = String(body?.payment_method || "");
  const notes = String(body?.notes || "");

  if (!loanId) {
    return NextResponse.json({ error: "Loan ID is required." }, { status: 400 });
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

  // Get loan details
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, employee_id, outstanding_balance, amount_approved, status, monthly_repayment, interest_rate, interest_calc_method")
    .eq("id", loanId)
    .single();

  if (loanError || !loan) {
    return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  }

  if (loan.status !== "disbursed" && loan.status !== "repaying") {
    return NextResponse.json({ error: "Loan must be disbursed to accept repayments." }, { status: 400 });
  }

  if (amount > Number(loan.outstanding_balance)) {
    return NextResponse.json({ error: "Payment amount exceeds outstanding balance." }, { status: 400 });
  }

  // Find the next pending repayment installment (uses the pre-built schedule)
  let pendingRepayment: any;
  try {
    pendingRepayment = await getOrCreateNextRepaymentInstallment(loanId);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unable to create repayment installment." }, { status: 400 });
  }

  const installmentDue = Number(pendingRepayment.amount_due) || 1;
  const installmentInterest = Number(pendingRepayment.interest_component) || 0;
  const installmentPrincipal = Number(pendingRepayment.principal_component) || 0;
  const alreadyPaid = Number(pendingRepayment.amount_paid) || 0;
  const remainingOnInstallment = Math.max(0, installmentDue - alreadyPaid);

  // Split the payment using the schedule's principal/interest ratio so
  // flat-rate (hire purchase) loans keep their pre-calculated interest and
  // do not benefit from paying early.
  let interestComponent: number;
  let principalComponent: number;

  if (amount >= remainingOnInstallment || installmentDue <= 0) {
    // Full installment payment: use the schedule's exact split
    interestComponent = installmentInterest;
    principalComponent = installmentPrincipal;
  } else {
    // Partial payment: apply the same interest/principal ratio as the schedule
    const interestRatio = installmentInterest / installmentDue;
    interestComponent = amount * interestRatio;
    principalComponent = amount - interestComponent;
  }

  // Update repayment record
  const newAmountPaid = alreadyPaid + amount;
  const newPrincipal = Number(pendingRepayment.principal_component) + principalComponent;
  const newInterest = Number(pendingRepayment.interest_component) + interestComponent;

  const isFullyPaid = newAmountPaid >= installmentDue;
  const repaymentStatus = isFullyPaid ? "paid" : "partial";

  const { error: updateRepaymentError } = await supabase
    .from("repayments")
    .update({
      amount_paid: newAmountPaid,
      principal_component: newPrincipal,
      interest_component: newInterest,
      paid_date: new Date().toISOString(),
      status: repaymentStatus,
      payment_method: paymentMethod,
      reference: generateReference("REPAY"),
      notes: notes || null,
    })
    .eq("id", pendingRepayment.id);

  if (updateRepaymentError) {
    return NextResponse.json({ error: updateRepaymentError.message || "Failed to update repayment." }, { status: 500 });
  }

  // Update loan outstanding balance
  const newOutstandingBalance = Math.max(0, Number(loan.outstanding_balance) - principalComponent);
  const newLoanStatus = newOutstandingBalance <= 0 ? "completed" : "repaying";

  const { error: updateLoanError } = await supabase
    .from("loans")
    .update({
      outstanding_balance: newOutstandingBalance,
      status: newLoanStatus,
    })
    .eq("id", loanId);

  if (updateLoanError) {
    return NextResponse.json({ error: updateLoanError.message || "Failed to update loan balance." }, { status: 500 });
  }

  // Create transaction record
  const transactionRef = generateReference("TXN");

  const { error: transactionError } = await supabase
    .from("transactions")
    .insert([
      {
        reference: transactionRef,
        employee_id: loan.employee_id,
        type: "loan_repayment",
        amount: amount,
        balance_before: Number(loan.outstanding_balance),
        balance_after: newOutstandingBalance,
        description: "Loan repayment",
        related_id: pendingRepayment.id,
        related_type: "repayment",
      },
    ] as any) as any;

  if (transactionError) {
    return NextResponse.json({ error: transactionError.message || "Failed to create transaction record." }, { status: 500 });
  }

  return NextResponse.json({
    message: "Repayment processed successfully",
    repayment: {
      id: pendingRepayment.id,
      amount_paid: newAmountPaid,
      status: repaymentStatus,
    },
    newOutstandingBalance,
    loanStatus: newLoanStatus,
  });
}
