import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/role-menus";
import { fetchDashboardStats, fetchEmployeeDashboardData } from "@/lib/dashboard/fetch-stats";
import DashboardWrapper from "@/features/dashboard/DashboardWrapper";

export const dynamic = "force-dynamic";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profile: any;
  try {
    const profileRes = await supabase
      .from("profiles")
      .select("id, full_name, role, employee_id, phone, is_active")
      .eq("user_id", user.id)
      .single();
    profile = profileRes.data;
  } catch (error) {
    console.error("[Dashboard] Profile fetch error:", error);
    redirect("/login");
  }

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;

  console.log('[Dashboard] User role:', role, 'Full profile:', profile);

  let data = null;
  let stats = null;

  try {
    if (role === "employee") {
      console.log('[Dashboard] Fetching employee dashboard data for user:', user.id, 'profile:', profile);
      data = await fetchEmployeeDashboardData(user.id, profile);
      console.log('[Dashboard] Employee dashboard data:', data);
    } else {
      console.log('[Dashboard] Fetching admin dashboard stats for role:', role);
      stats = await fetchDashboardStats(role);
      console.log('[Dashboard] Admin dashboard stats:', stats);
    }
  } catch (error) {
    console.error("[Dashboard] Data fetch error:", error);
  }

  return (
    <DashboardWrapper role={role} data={data} stats={stats} />
  );
}
