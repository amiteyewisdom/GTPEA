// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const loanId = String(body?.loan_id);
  const bankName = String(body?.bank_name || "");
  const bankAccountNo = String(body?.bank_account_no || "");

  if (!loanId) {
    return NextResponse.json({ error: "Loan ID is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Fetch loan details
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .single() as any;

  if (loanError || !loan) {
    return NextResponse.json({ error: "Loan not found." }, { status: 404 });
  }

  if (loan.status !== "approved") {
    return NextResponse.json({ error: "Loan must be approved before disbursement." }, { status: 400 });
  }

  if (loan.amount_disbursed && loan.amount_disbursed > 0) {
    return NextResponse.json({ error: "Loan has already been disbursed." }, { status: 400 });
  }

  // Update loan with disbursement details
  const { data: updatedLoan, error: updateError } = await supabase
    .from("loans")
    .update({
      amount_disbursed: loan.amount_approved,
      disbursement_date: new Date().toISOString().split("T")[0],
      disbursed_by: user.id,
      bank_name: bankName,
      bank_account_no: bankAccountNo,
      status: "active",
    } as any)
    .eq("id", loanId)
    .select()
    .single() as any;

  if (updateError || !updatedLoan) {
    return NextResponse.json({ error: updateError?.message || "Failed to disburse loan." }, { status: 500 });
  }

  // Create transaction record
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert([
      {
        type: "loan_disbursement",
        amount: loan.amount_approved,
        reference: loan.loan_ref,
        description: `Loan disbursement for ${loan.loan_ref}`,
        status: "completed",
      },
    ] as any);

  if (transactionError) {
    console.error("Failed to create transaction record:", transactionError);
  }

  return NextResponse.json({ message: "Loan disbursed successfully", loan: updatedLoan });
}
