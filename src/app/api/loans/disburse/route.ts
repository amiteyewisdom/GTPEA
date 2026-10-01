// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRepaymentSchedule } from "@/lib/loans/repayment-schedule";

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

  // Only the fund manager (or admins) can record a disbursement —
  // money is handed over manually, this marks it as given.
  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single() as any;

  if (!["fund_manager", "administrator", "super_admin"].includes(actorProfile?.role ?? "")) {
    return NextResponse.json({ error: "Only the Fund Manager can disburse loans." }, { status: 403 });
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

  // Only fully board-approved loans (status 'approved') can be disbursed.
  // Imported 'active' loans were disbursed manually outside the system and
  // must not go through this flow. amount_disbursed is the real
  // double-disbursement guard.
  if (loan.status !== "approved") {
    return NextResponse.json({ error: "Loan must be fully approved before disbursement." }, { status: 400 });
  }

  if (loan.amount_disbursed && loan.amount_disbursed > 0) {
    return NextResponse.json({ error: "Loan has already been disbursed." }, { status: 400 });
  }

  const disbursedAmount = Number(loan.amount_approved) || Number(loan.amount_requested) || 0;

  // Update loan with disbursement details — the money is handed over manually;
  // recording it here is what makes the loan count as money out / owed.
  const { data: updatedLoan, error: updateError } = await supabase
    .from("loans")
    .update({
      amount_disbursed: disbursedAmount,
      outstanding_balance: disbursedAmount,
      disbursement_date: new Date().toISOString().split("T")[0],
      disbursed_by: user.id,
      bank_name: bankName,
      bank_account_no: bankAccountNo,
      status: "repaying", // money is out, repayment begins
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
        amount: disbursedAmount,
        reference: loan.loan_ref,
        description: `Loan disbursement for ${loan.loan_ref}`,
        status: "completed",
      },
    ] as any);

  if (transactionError) {
    console.error("Failed to create transaction record:", transactionError);
  }

  // Create repayment schedule for the disbursed loan
  try {
    await createRepaymentSchedule({
      loan_id: loanId,
      employee_id: loan.employee_id,
      principal: Number(loan.amount_approved) || Number(loan.amount_requested) || 0,
      monthly_repayment: Number(loan.monthly_repayment) || 0,
      term_months: Number(loan.term_months) || 1,
      interest_rate: Number(loan.interest_rate) || 0,
      start_date: updatedLoan.disbursement_date || new Date().toISOString().split("T")[0],
      interest_calc_method: loan.interest_calc_method ?? null,
    });
  } catch (scheduleError) {
    console.error("Failed to create repayment schedule:", scheduleError);
  }

  // Notify the applicant that the loan was recorded as disbursed
  try {
    const admin = createAdminClient();
    const { data: applicantProfile } = await admin
      .from("profiles")
      .select("user_id")
      .eq("employee_id", loan.employee_id)
      .maybeSingle();
    if (applicantProfile?.user_id) {
      await admin.from("notifications").insert({
        user_id: applicantProfile.user_id,
        type: "loan_disbursed",
        title: "Loan Disbursed",
        message: `Loan ${loan.loan_ref} has been recorded as disbursed. Repayment will begin via payroll deduction.`,
        entity_type: "loan",
        entity_id: loanId,
      });
    }
  } catch (notifErr) {
    console.error("Failed to send disbursement notification:", notifErr);
  }

  return NextResponse.json({ message: "Loan disbursed successfully", loan: updatedLoan });
}
