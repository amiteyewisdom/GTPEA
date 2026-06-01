import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "@/features/reports/ReportsClient";
import type { Savings, Loan } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const supabase = await createClient();

  const [
    totalEmployeesRes,
    activeLoansRes,
    totalApprovalsRes,
    savingsRes,
    loanRes,
  ] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("loans").select("id", { count: "exact", head: true }).in("status", ["disbursed", "repaying"]),
    supabase.from("approvals").select("id", { count: "exact", head: true }),
    supabase.from("savings").select("balance, type, status"),
    supabase.from("loans").select("outstanding_balance, amount_disbursed, status, interest_rate"),
  ]);

  const savingsData = savingsRes.data as Savings[] | null;
  const loanData = loanRes.data as Loan[] | null;

  const totalSavings = savingsData?.reduce((s, r) => s + (r.balance ?? 0), 0) ?? 0;
  const totalOutstanding = loanData?.reduce((s, r) => s + (r.outstanding_balance ?? 0), 0) ?? 0;
  const totalDisbursed = loanData?.reduce((s, r) => s + (r.amount_disbursed ?? 0), 0) ?? 0;

  const summary = {
    totalEmployees: totalEmployeesRes.count ?? 0,
    activeLoans: activeLoansRes.count ?? 0,
    totalApprovals: totalApprovalsRes.count ?? 0,
    totalSavings,
    totalOutstanding,
    totalDisbursed,
    defaultRate: loanData
      ? ((loanData.filter((l) => l.status === "defaulted").length / Math.max(loanData.length, 1)) * 100)
      : 0,
  };

  return <ReportsClient summary={summary} />;
}
