import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/role-menus";
import { fetchDashboardStats, fetchEmployeeDashboardData } from "@/lib/dashboard/fetch-stats";
import EmployeeDashboard from "@/features/dashboard/EmployeeDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let profile;
  try {
    const profileRes = await supabase
      .from("profiles")
      .select("full_name, role, employee_id")
      .eq("user_id", user.id)
      .single() as any;
    profile = profileRes.data;
  } catch (error) {
    console.error("[Dashboard] Profile fetch error:", error);
    redirect("/login");
  }

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;

  if (role === "employee") {
    try {
      const dashboardData = await fetchEmployeeDashboardData(user.id, profile);
      // Try to load EmployeeDashboard with dynamic import
      const EmployeeDashboard = (await import('@/features/dashboard/EmployeeDashboard')).default;
      return <EmployeeDashboard data={dashboardData} />;
    } catch (error) {
      console.error("[Dashboard] Employee dashboard error:", error);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600">Welcome, {profile.full_name || 'User'}</p>
          <p className="text-red-600 mt-4">Error loading dashboard: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      );
    }
  }

  // For other roles, show simplified version for now
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome, {profile.full_name || 'User'}</p>
      <p className="text-gray-500 mt-2">Role: {role}</p>
      <p className="text-gray-500 mt-4">Full dashboard for {role} is being restored...</p>
    </div>
  );
}
