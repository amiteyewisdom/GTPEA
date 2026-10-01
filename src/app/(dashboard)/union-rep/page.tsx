import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import UnionRepDashboard from "@/features/dashboard/UnionRepDashboard";

export default async function UnionRepPage() {
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

  if (!profile || (profile as any).role !== "union_rep") {
    redirect("/dashboard");
  }

  const stats = await fetchDashboardStats((profile as any).role);
  return <UnionRepDashboard stats={stats} />;
}
