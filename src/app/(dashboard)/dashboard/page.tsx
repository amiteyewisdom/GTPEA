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
      return <EmployeeDashboard />;
  }
}