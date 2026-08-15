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

  // Completely simplified dashboard without any data fetching
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome Back, {profile.full_name || 'User'}</h1>
        <p className="text-gray-600">Manage your savings, loans, and financial goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-sm text-gray-600 mb-2">Savings Balance</h3>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-sm text-gray-600 mb-2">Loan Balance</h3>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-sm text-gray-600 mb-2">Pending Requests</h3>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      </div>

      <div className="p-6 bg-white border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Active Loans</h3>
        <p className="text-gray-600">Loading...</p>
      </div>

      <div className="p-6 bg-white border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
