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
      return <DashboardWrapper role={role} data={dashboardData} />;
    } catch (error) {
      console.error("[Dashboard] Employee dashboard error:", error);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
          <p className="text-red-600">Failed to load dashboard data. Please try again or contact support.</p>
          <p className="text-sm text-gray-500 mt-2">Error: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      );
    }
  }

  let stats;
  try {
    stats = await fetchDashboardStats();
  } catch (error) {
    console.error("[Dashboard] Stats fetch error:", error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
        <p className="text-red-600">Failed to load dashboard statistics. Please try again or contact support.</p>
        <p className="text-sm text-gray-500 mt-2">Error: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }

  return <DashboardWrapper role={role} stats={stats} />;
}
