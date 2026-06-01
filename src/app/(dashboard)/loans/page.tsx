import { createClient } from "@/lib/supabase/server";
import type { Loan } from "@/types/database";
import { LoansClient } from "@/features/loans/LoansClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Loans" };

export default async function LoansPage() {
  const supabase = await createClient();

  const { data: loans, count } = await supabase
    .from("loans")
    .select(
      `*, employees (first_name, last_name, employee_no, department), loan_products (name)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });
  const typedLoans = loans as Loan[] | null;

  const totalDisbursed = typedLoans?.filter((l) => l.amount_disbursed).reduce((sum, l) => sum + (l.amount_disbursed ?? 0), 0) ?? 0;

  const totalOutstanding = typedLoans?.reduce((sum, l) => sum + (l.outstanding_balance ?? 0), 0) ?? 0;

  return (
    <LoansClient
      loans={typedLoans ?? []}
      total={count ?? 0}
      totalDisbursed={totalDisbursed}
      totalOutstanding={totalOutstanding}
    />
  );
}
