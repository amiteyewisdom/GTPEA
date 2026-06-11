import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/role-menus";
import { fetchDashboardStats, fetchEmployeeDashboardData } from "@/lib/dashboard/fetch-stats";
import SuperAdminDashboard from "@/features/dashboard/SuperAdminDashboard";
import AdministratorDashboard from "@/features/dashboard/AdministratorDashboard";
import ChairpersonDashboard from "@/features/dashboard/ChairpersonDashboard";
import FundManagerDashboard from "@/features/dashboard/FundManagerDashboard";
import UnionRepDashboard from "@/features/dashboard/UnionRepDashboard";
import EmployeeDashboard from "@/features/dashboard/EmployeeDashboard";

export const dynamic = "force-dynamic";

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

  if (role === "employee") {
    const dashboardData = await fetchEmployeeDashboardData(user.id, profile);
    return <EmployeeDashboard data={dashboardData} />;
  }

  const stats = await fetchDashboardStats();

  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard stats={stats} />;
    case "administrator":
      return <AdministratorDashboard stats={stats} />;
    case "chairperson":
      return <ChairpersonDashboard stats={stats} />;
    case "fund_manager":
      return <FundManagerDashboard stats={stats} />;
    case "union_rep":
      return <UnionRepDashboard stats={stats} />;
    default:
      redirect("/login");
  }
}
