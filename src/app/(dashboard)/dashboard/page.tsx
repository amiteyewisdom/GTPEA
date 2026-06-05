import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleDashboard } from "@/features/dashboard/RoleDashboard";
import type { UserRole } from "@/types/index";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, employee_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  const [employeesCount, activeEmployeesCount, loanProductsCount, openApprovalsCount, activeLoansCount, employeeLoanData] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("loan_products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("loans").select("id", { count: "exact", head: true }).in("status", ["pending", "approved", "disbursed", "repaying"]),
    profile.employee_id
      ? supabase.from("loans").select("amount, outstanding_balance, status").eq("employee_id", profile.employee_id)
      : Promise.resolve({ data: null, error: null }),
  ]);

  const loans = Array.isArray(employeeLoanData?.data) ? employeeLoanData.data : [];
  const myActiveLoans = loans.filter(
    (loan) => loan.status !== "completed" && loan.status !== "rejected" && loan.status !== "defaulted"
  ).length;
  const myOutstandingBalance = loans.reduce(
    (sum, loan) => sum + Number(loan.outstanding_balance ?? loan.amount ?? 0),
    0
  );
  const myPendingApplications = loans.filter((loan) => loan.status === "pending").length;

  const metrics = {
    totalEmployees: employeesCount.count ?? 0,
    activeEmployees: activeEmployeesCount.count ?? 0,
    loanProductsActive: loanProductsCount.count ?? 0,
    pendingApprovals: openApprovalsCount.count ?? 0,
    activeLoans: activeLoansCount.count ?? 0,
    myActiveLoans,
    myPendingApplications,
    myOutstandingBalance,
    fundBalance: 8200000,
    reviewsInQueue: openApprovalsCount.count ?? 0,
    totalLoansOutstanding: 34200000,
  };

  return (
    <RoleDashboard
      user={profile as { full_name: string; role: UserRole; employee_id?: string | null }}
      metrics={metrics}
    />
  );
}
