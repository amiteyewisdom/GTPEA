import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import FundManagerDashboard from "@/features/dashboard/FundManagerDashboard";

export default async function FundManagerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile as any).role !== "fund_manager") {
    redirect("/dashboard");
  }

  const stats = await fetchDashboardStats((profile as any).role);
  return <FundManagerDashboard stats={stats} />;
}
