import { createClient } from "@/lib/supabase/server";

export interface RepaymentScheduleInput {
  loan_id: string;
  employee_id: string;
  principal: number;
  monthly_repayment: number;
  term_months: number;
  interest_rate: number;
  start_date: string;
  interest_calc_method?: string | null;
}

export async function createRepaymentSchedule(input: RepaymentScheduleInput) {
  const supabase = await createClient();

  const {
    loan_id,
    employee_id,
    principal,
    monthly_repayment,
    term_months,
    interest_rate,
    start_date,
    interest_calc_method,
  } = input;

  const count = Math.max(1, term_months || 1);
  const baseMonthly = Math.max(0, Number(monthly_repayment) || 0);
  const rate = Math.max(0, Number(interest_rate) || 0) / 100;
  const start = new Date(start_date || new Date().toISOString());

  const isFlatRate = interest_calc_method === "flat_rate";
  const totalFlatInterest = isFlatRate ? principal * rate * (count / 12) : 0;
  const flatMonthlyInterest = isFlatRate ? totalFlatInterest / count : 0;
  const flatMonthlyPrincipal = isFlatRate ? baseMonthly - flatMonthlyInterest : 0;

  let remainingBalance = principal;
  const installments = [];

  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    let amountDue = baseMonthly;
    let interestComponent = 0;
    let principalComponent = 0;

    if (isFlatRate) {
      interestComponent = flatMonthlyInterest;
      principalComponent = flatMonthlyPrincipal;
    } else {
      // Reducing balance / amortization
      const monthlyRate = rate / 12;
      interestComponent = remainingBalance * monthlyRate;
      principalComponent = amountDue - interestComponent;
      if (principalComponent < 0) {
        principalComponent = 0;
        interestComponent = amountDue;
      }
      // Adjust last installment to clear remaining balance
      if (i === count && remainingBalance > 0) {
        amountDue = remainingBalance + interestComponent;
      }
    }

    remainingBalance = Math.max(0, remainingBalance - principalComponent);

    installments.push({
      loan_id,
      employee_id,
      installment_no: i,
      amount_due: Number(amountDue.toFixed(2)),
      amount_paid: 0,
      principal_component: Number(principalComponent.toFixed(2)),
      interest_component: Number(interestComponent.toFixed(2)),
      due_date: dueDate.toISOString().split("T")[0],
      status: "pending" as const,
      payment_method: null,
      reference: null,
      notes: null,
    });
  }

  const { data, error } = await supabase.from("repayments").insert(installments).select();
  if (error) {
    console.error("[createRepaymentSchedule] failed to insert schedule:", error.message);
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function getOrCreateNextRepaymentInstallment(loanId: string) {
  const supabase = await createClient();

  const { data: existingPending } = await supabase
    .from("repayments")
    .select("*")
    .eq("loan_id", loanId)
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(1)
    .single();

  if (existingPending) {
    return existingPending as any;
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, employee_id, outstanding_balance, amount_approved, amount_disbursed, monthly_repayment, interest_rate, term_months, disbursement_date, expected_completion_date")
    .eq("id", loanId)
    .single();

  if (loanError || !loan) {
    throw new Error("Loan not found.");
  }

  const { data: maxInstallment } = await supabase
    .from("repayments")
    .select("installment_no")
    .eq("loan_id", loanId)
    .order("installment_no", { ascending: false })
    .limit(1)
    .single();

  const nextNo = (maxInstallment?.installment_no ?? 0) + 1;
  const outstanding = Number(loan.outstanding_balance) || 0;

  if (outstanding <= 0) {
    throw new Error("Loan is already fully paid.");
  }

  const lastDueDate = await supabase
    .from("repayments")
    .select("due_date")
    .eq("loan_id", loanId)
    .order("due_date", { ascending: false })
    .limit(1)
    .single();

  const startDate = lastDueDate?.data?.due_date
    ? new Date(lastDueDate.data.due_date)
    : loan.disbursement_date
    ? new Date(loan.disbursement_date)
    : new Date();
  startDate.setMonth(startDate.getMonth() + 1);

  const monthlyRepayment = Number(loan.monthly_repayment) || outstanding;
  const amountDue = Math.min(monthlyRepayment, outstanding);

  const { data: newInstallment, error: insertError } = await supabase
    .from("repayments")
    .insert({
      loan_id: loanId,
      employee_id: loan.employee_id,
      installment_no: nextNo,
      amount_due: amountDue,
      amount_paid: 0,
      principal_component: 0,
      interest_component: 0,
      due_date: startDate.toISOString().split("T")[0],
      status: "pending",
      payment_method: null,
      reference: null,
      notes: null,
    })
    .select()
    .single();

  if (insertError || !newInstallment) {
    throw new Error(insertError?.message || "Failed to create repayment installment.");
  }

  return newInstallment as any;
}
