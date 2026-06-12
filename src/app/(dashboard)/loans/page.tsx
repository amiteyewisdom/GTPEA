import { createClient } from "@/lib/supabase/server";
import type { Loan } from "@/types/database";
import { LoansClient } from "@/features/loans/LoansClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Loans" };

export default async function LoansPage() {
  const supabase = await createClient();

  const [loanProductsRes, loansRes] = await Promise.all([
    supabase
      .from("loan_products")
      .select("id, name, interest_rate, interest_calc_method, min_amount, max_amount, min_term_months, max_term_months, account_code, description, is_active")
      .eq("is_active", true),
    supabase
      .from("loans")
      .select(
        `*, employees!employee_id (first_name, last_name, employee_no, department, email), loan_products (name, interest_calc_method)`,
        { count: "exact" }
      )
      .order("created_at", { ascending: false }),
  ]);

  const allLoans = (loansRes.data ?? []) as any[];
  const filteredLoans = allLoans.filter((l) => (l.employees as any)?.email !== "superadmin@gtpea.com");
  const typedLoans = filteredLoans as Loan[];
  const loanProducts = loanProductsRes.data ?? [];

  const totalDisbursed = typedLoans.filter((l) => l.amount_disbursed).reduce((sum, l) => sum + (l.amount_disbursed ?? 0), 0);
  const totalOutstanding = typedLoans.reduce((sum, l) => sum + (l.outstanding_balance ?? 0), 0);

  return (
    <LoansClient
      loans={typedLoans ?? []}
      loanProducts={loanProducts}
      total={loansRes.count ?? 0}
      totalDisbursed={totalDisbursed}
      totalOutstanding={totalOutstanding}
    />
  );
}
