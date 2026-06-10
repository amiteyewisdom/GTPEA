import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/role-menus";
import SuperAdminDashboard from "@/features/dashboard/SuperAdminDashboard";
import AdministratorDashboard from "@/features/dashboard/AdministratorDashboard";
import ChairpersonDashboard from "@/features/dashboard/ChairpersonDashboard";
import FundManagerDashboard from "@/features/dashboard/FundManagerDashboard";
import UnionRepDashboard from "@/features/dashboard/UnionRepDashboard";
import EmployeeDashboard from "@/features/dashboard/EmployeeDashboard";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, employee_id")
    .eq("user_id", user.id)
    .single() as any;

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;

  // Fetch dashboard data for employee role
  if (role === "employee" && profile.employee_id) {
    const [savingsRes, loansRes, approvalsRes, transactionsRes] = await Promise.all([
      supabase.from("savings").select("balance, account_number, type").eq("employee_id", profile.employee_id),
      supabase.from("loans").select("*").eq("employee_id", profile.employee_id).in("status", ["active", "repaying"]),
      supabase.from("approvals").select("*").eq("submitted_by", user.id).eq("status", "pending"),
      supabase.from("transactions").select("*").eq("employee_id", profile.employee_id).order("created_at", { ascending: false }).limit(5),
    ]);

    const savingsData = savingsRes.data || [];
    const loansData = loansRes.data || [];
    const approvalsData = approvalsRes.data || [];
    const transactionsData = transactionsRes.data || [];

    const totalSavings = savingsData.reduce((sum: number, s: any) => sum + (s.balance || 0), 0);
    const totalLoanBalance = loansData.reduce((sum: number, l: any) => sum + (l.outstanding_balance || 0), 0);

    const dashboardData = {
      fullName: profile.full_name,
      totalSavings,
      totalLoanBalance,
      pendingRequests: approvalsData.length,
      activeLoans: loansData,
      recentActivity: transactionsData,
      pendingApplications: approvalsData,
    };

    return <EmployeeDashboard data={dashboardData} />;
  }

  // Render the appropriate dashboard based on role
  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'administrator':
      return <AdministratorDashboard />;
    case 'chairperson':
      return <ChairpersonDashboard />;
    case 'fund_manager':
      return <FundManagerDashboard />;
    case 'union_rep':
      return <UnionRepDashboard />;
    case 'employee':
    default:
      return <EmployeeDashboard data={{ fullName: profile.full_name, totalSavings: 0, totalLoanBalance: 0, pendingRequests: 0, activeLoans: [], recentActivity: [], pendingApplications: [] }} />;
  }
}