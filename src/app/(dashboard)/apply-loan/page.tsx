import { createClient } from "@/lib/supabase/server";
import { LoanApplication } from "@/features/loans/LoanApplication";
import { getLoggedInEmployee } from "@/lib/loans/employee";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Apply for Loan" };

export default async function ApplyLoanPage() {
  const supabase = await createClient();

  const [loanProductsRes, employee] = await Promise.all([
    supabase
      .from("loan_products")
      .select("id, name, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, description")
      .eq("is_active", true),
    getLoggedInEmployee(supabase),
  ]);

  let savingsBalance = 0;
  let activeLoanBalance = 0;

  if (employee?.employeeId) {
    const [savingsRes, loansRes] = await Promise.all([
      supabase.from("savings").select("balance").eq("employee_id", employee.employeeId).eq("status", "active"),
      supabase.from("loans").select("outstanding_balance").eq("employee_id", employee.employeeId).in("status", ["approved", "disbursed", "repaying"]),
    ]);
    savingsBalance = (savingsRes.data ?? []).reduce((s: number, r: any) => s + Number(r.balance ?? 0), 0);
    activeLoanBalance = (loansRes.data ?? []).reduce((s: number, r: any) => s + Number(r.outstanding_balance ?? 0), 0);
  }

  const maxBorrowable = Math.max(0, savingsBalance * 3 - activeLoanBalance);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Apply for Loan</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Submit a new loan application
        </p>
      </div>
      <LoanApplication
        loanProducts={loanProductsRes.data ?? []}
        maxBorrowable={maxBorrowable}
        savingsBalance={savingsBalance}
        activeLoanBalance={activeLoanBalance}
      />
    </div>
  );
}
