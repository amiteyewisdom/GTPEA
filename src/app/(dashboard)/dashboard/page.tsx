import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/features/dashboard/DashboardClient";
import type { Metadata } from "next";
import type { Savings, Loan, Transaction } from "@/types/database";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const totalEmployeesRes = await supabase.from("employees").select("id", { count: "exact", head: true });
  const activeEmployeesRes = await supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "active");
  const activeLoansRes = await supabase.from("loans").select("id", { count: "exact", head: true }).in("status", ["approved", "disbursed", "repaying"]);
  const pendingApprovalsRes = await supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending");
  const savingsRes = await supabase.from("savings").select("balance").eq("status", "active");
  const loansRes = await supabase.from("loans").select("outstanding_balance").in("status", ["disbursed", "repaying"]);
  const recentTransactionsRes = await supabase
    .from("transactions")
    .select("id, type, amount, description, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const savingsSummary = savingsRes.data as Savings[] | null;
  const loansSummary = loansRes.data as Loan[] | null;
  const recentTransactions = recentTransactionsRes.data as Transaction[] | null;

  const totalSavings = savingsSummary?.reduce((sum, s) => sum + (s.balance ?? 0), 0) ?? 0;
  const totalOutstanding = loansSummary?.reduce((sum, l) => sum + (l.outstanding_balance ?? 0), 0) ?? 0;

  const kpis = {
    totalEmployees: totalEmployeesRes.count ?? 0,
    activeEmployees: activeEmployeesRes.count ?? 0,
    totalSavings,
    totalOutstanding,
    activeLoans: activeLoansRes.count ?? 0,
    pendingApprovals: pendingApprovalsRes.count ?? 0,
  };

  return (
    <DashboardClient
      kpis={kpis}
      recentTransactions={recentTransactions ?? []}
    />
  );
}
