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
      .select("*")
      .eq("user_id", user.id)
      .single();
    profile = profileRes.data;
  } catch (error) {
    console.error("[Dashboard] Profile fetch error:", error);
    redirect("/login");
  }

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;

  let data = null;
  let stats = null;

  try {
    if (role === "employee") {
      data = await fetchEmployeeDashboardData(user.id, profile);
    } else {
      stats = await fetchDashboardStats();
    }
  } catch (error) {
    console.error("[Dashboard] Data fetch error:", error);
  }

  return (
    <DashboardWrapper role={role} data={data} stats={stats} />
  );
}
