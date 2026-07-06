import { createClient } from "@/lib/supabase/server";
import type { Loan } from "@/types/database";
import { LoansClient } from "@/features/loans/LoansClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Loans" };

export default async function LoansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profileRes = user
    ? await supabase.from("profiles").select("role").eq("user_id", user.id).single()
    : { data: null };
  const currentProfile = (profileRes?.data ?? null) as { role: string } | null;

  const [loanProductsRes, loansRes, employeeProfilesRes] = await Promise.all([
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
    supabase.from("profiles").select("employee_id").eq("role", "employee").not("employee_id", "is", null),
  ]);

  const employeeOnlyIds = new Set(
    (employeeProfilesRes.data ?? []).map((p: any) => p.employee_id)
  );

  const allLoans = (loansRes.data ?? []) as any[];
  // Only show loans belonging to actual employee-role members (exclude admin/manager/rep accounts)
  const filteredLoans = allLoans.filter((l) =>
    employeeOnlyIds.size === 0 || employeeOnlyIds.has(l.employee_id)
  );
  const typedLoans = filteredLoans as Loan[];
  const loanProducts = loanProductsRes.data ?? [];

  const totalDisbursed = typedLoans.reduce((sum, l) => {
    return sum + (Number(l.amount_disbursed) || Number(l.amount_approved) || Number(l.amount_requested) || 0);
  }, 0);
  const totalOutstanding = typedLoans.reduce((sum, l) => {
    return sum + (Number(l.outstanding_balance) || Number(l.amount_approved) || Number(l.amount_requested) || 0);
  }, 0);

  return (
    <LoansClient
      loans={typedLoans ?? []}
      loanProducts={loanProducts}
      total={typedLoans.length}
      totalDisbursed={totalDisbursed}
      totalOutstanding={totalOutstanding}
      userRole={(currentProfile?.role as string) ?? "employee"}
    />
  );
}
