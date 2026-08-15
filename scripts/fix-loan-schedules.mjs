// Script to create repayment schedules for existing loans that don't have them
import { createClient } from "../src/lib/supabase/server.js";
import { createRepaymentSchedule } from "../src/lib/loans/repayment-schedule.js";

async function fixLoanSchedules() {
  const supabase = await createClient();

  // Find loans that are approved/disbursed but have no repayment schedules
  const { data: loans, error } = await supabase
    .from("loans")
    .select("id, loan_ref, employee_id, amount_approved, amount_requested, monthly_repayment, term_months, interest_rate, disbursement_date, status, created_at")
    .in("status", ["approved", "disbursed", "repaying"]);

  if (error) {
    console.error("Error fetching loans:", error);
    return;
  }

  console.log(`Found ${loans.length} loans to check...`);

  // Get loans that have no repayment schedules
  const loanIds = loans.map(l => l.id);
  const { data: repayments } = await supabase
    .from("repayments")
    .select("loan_id")
    .in("loan_id", loanIds);

  const loansWithSchedules = new Set((repayments || []).map(r => r.loan_id));
  const loansNeedingSchedules = loans.filter(l => !loansWithSchedules.has(l.id));

  console.log(`Found ${loansNeedingSchedules.length} loans needing repayment schedules...`);

  for (const loan of loansNeedingSchedules) {
    console.log(`Processing loan ${loan.loan_ref}...`);

    // Set disbursement date if not set (use created_at or today)
    const disbursementDate = loan.disbursement_date || loan.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    
    // Set amount_approved if not set (use amount_requested or calculate from monthly_payment * term_months)
    const amountApproved = loan.amount_approved || loan.amount_requested || (Number(loan.monthly_repayment) * Number(loan.term_months));

    // Update loan with disbursement details
    const { error: updateError } = await supabase
      .from("loans")
      .update({
        disbursement_date: disbursementDate,
        amount_approved: amountApproved,
        status: "disbursed"
      })
      .eq("id", loan.id);

    if (updateError) {
      console.error(`  Error updating loan ${loan.loan_ref}:`, updateError);
      continue;
    }

    // Create repayment schedule
    try {
      await createRepaymentSchedule({
        loan_id: loan.id,
        employee_id: loan.employee_id,
        principal: Number(amountApproved),
        monthly_repayment: Number(loan.monthly_repayment),
        term_months: Number(loan.term_months),
        interest_rate: Number(loan.interest_rate),
        start_date: disbursementDate,
        interest_calc_method: "reducing_balance"
      });
      console.log(`  ✓ Created repayment schedule for ${loan.loan_ref}`);
    } catch (scheduleError) {
      console.error(`  Error creating schedule for ${loan.loan_ref}:`, scheduleError);
    }
  }

  console.log("Done!");
}

fixLoanSchedules().catch(console.error);
