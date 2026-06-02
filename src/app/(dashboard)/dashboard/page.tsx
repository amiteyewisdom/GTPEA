import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardRouter() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = profile?.role;

  // This is the direct mapping of role to folder
  const routes: Record<string, string> = {
    "super_admin": "/dashboard/Admin",
    "administrator": "/dashboard/Admin",
    "chairperson": "/chair",
    "union_rep": "/union",
    "fund_manager": "/fund",
    "employee": "/employee",
  };

  const destination = routes[role || ""] || "/employee";
  redirect(destination);
}
