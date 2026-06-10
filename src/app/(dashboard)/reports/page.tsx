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
    savingsContributionsRes,
    transactionsRes,
  ] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("loans").select("id", { count: "exact", head: true }).in("status", ["disbursed", "repaying"]),
    supabase.from("approvals").select("id", { count: "exact", head: true }),
    supabase.from("savings").select("balance, type, status"),
    supabase.from("loans").select("outstanding_balance, amount_disbursed, status, interest_rate"),
    supabase.from("savings_contributions").select("amount, contribution_date").order("contribution_date", { ascending: true }).limit(100),
    supabase.from("transactions").select("amount, type, created_at").order("created_at", { ascending: true }).limit(100),
  ]);

  const savingsData = savingsRes.data as Savings[] | null;
  const loanData = loanRes.data as Loan[] | null;
  const contributionsData = savingsContributionsRes.data as any[] | null;
  const transactionsData = transactionsRes.data as any[] | null;

  const totalSavings = savingsData?.reduce((s, r) => s + (r.balance ?? 0), 0) ?? 0;
  const totalOutstanding = loanData?.reduce((s, r) => s + (r.outstanding_balance ?? 0), 0) ?? 0;
  const totalDisbursed = loanData?.reduce((s, r) => s + (r.amount_disbursed ?? 0), 0) ?? 0;

  // Aggregate savings contributions by month for chart data
  const savingsChartData = contributionsData?.reduce((acc: any[], curr: any) => {
    const date = new Date(curr.contribution_date);
    const month = date.toLocaleString("default", { month: "short" });
    const existing = acc.find((item: any) => item.month === month);
    if (existing) {
      existing.contributions += curr.amount;
    } else {
      acc.push({ month, contributions: curr.amount, savings: 0, disbursed: 0, repaid: 0 });
    }
    return acc;
  }, []) || [];

  // Ensure savings chart data has all required fields
  savingsChartData.forEach((item: any) => {
    item.savings = totalSavings;
    item.disbursed = 0;
    item.repaid = 0;
  });

  // Aggregate loan transactions by month for chart data
  const loanChartData = transactionsData?.reduce((acc: any[], curr: any) => {
    const date = new Date(curr.created_at);
    const month = date.toLocaleString("default", { month: "short" });
    const existing = acc.find((item: any) => item.month === month);
    if (existing) {
      if (curr.type === "loan_disbursement") {
        existing.disbursed += curr.amount;
      } else if (curr.type === "loan_repayment") {
        existing.repaid += curr.amount;
      }
    } else {
      acc.push({ 
        month, 
        disbursed: curr.type === "loan_disbursement" ? curr.amount : 0,
        repaid: curr.type === "loan_repayment" ? curr.amount : 0,
        savings: 0,
        contributions: 0,
      });
    }
    return acc;
  }, []) || [];

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

  return <ReportsClient summary={summary} savingsChartData={savingsChartData} loanChartData={loanChartData} />;
}
