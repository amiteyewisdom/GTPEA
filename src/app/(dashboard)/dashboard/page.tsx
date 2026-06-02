import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = profile?.role;

  const routes: Record<string, string> = {
    "super_admin": "/dashboard/Admin",
    "administrator": "/dashboard/Admin",
    "chairperson": "/approvals",
    "union_rep": "/employees",
    "fund_manager": "/ledger",
    "employee": "/profile",
  };

  redirect(routes[role || ""] || "/profile");
}
