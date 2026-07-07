import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRepaymentSchedule } from "@/lib/loans/repayment-schedule";

const BACKFILL_ROLES = ["fund_manager", "super_admin", "administrator", "chairperson"];

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profileRes = (await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()) as any;

  const role = profileRes.data?.role;
  if (!BACKFILL_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Find disbursed/repaying loans that have no repayment schedule yet
  const { data: loans, error: loansError } = (await supabase
    .from("loans")
    .select("id, employee_id, amount_approved, amount_requested, monthly_repayment, term_months, interest_rate, disbursement_date")
    .in("status", ["disbursed", "repaying"])) as any;

  if (loansError) {
    return NextResponse.json({ error: loansError.message }, { status: 500 });
  }

  const loanIds = ((loans ?? []) as any[]).map((l) => l.id).filter(Boolean);
  if (loanIds.length === 0) {
    return NextResponse.json({ created: 0, message: "No active loans to backfill." });
  }

  const { data: existingRepayments } = (await supabase
    .from("repayments")
    .select("loan_id")
    .in("loan_id", loanIds)) as any;

  const loansWithRepayments = new Set(((existingRepayments ?? []) as any[]).map((r) => r.loan_id));
  const loansNeedingSchedules = ((loans ?? []) as any[]).filter((l) => !loansWithRepayments.has(l.id));

  let created = 0;
  const errors: string[] = [];

  for (const loan of loansNeedingSchedules) {
    try {
      await createRepaymentSchedule({
        loan_id: loan.id,
        employee_id: loan.employee_id,
        principal: Number(loan.amount_approved) || Number(loan.amount_requested) || 0,
        monthly_repayment: Number(loan.monthly_repayment) || 0,
        term_months: Number(loan.term_months) || 1,
        interest_rate: Number(loan.interest_rate) || 0,
        start_date: loan.disbursement_date || new Date().toISOString().split("T")[0],
        interest_calc_method: loan.interest_calc_method ?? null,
      });
      created += 1;
    } catch (err: any) {
      errors.push(`Loan ${loan.id}: ${err.message || "Unknown error"}`);
    }
  }

  return NextResponse.json({
    created,
    checked: loansNeedingSchedules.length,
    errors: errors.length > 0 ? errors : undefined,
    message: `Created ${created} repayment schedule${created === 1 ? "" : "s"}.`,
  });
}
