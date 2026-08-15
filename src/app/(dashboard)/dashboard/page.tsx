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

  // Simplified dashboard to isolate the error
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Welcome, {profile.full_name || 'User'}</p>
      <p className="text-gray-500 mt-2">Role: {role}</p>
      <p className="text-gray-500 mt-2">User ID: {user.id}</p>
    </div>
  );
}
