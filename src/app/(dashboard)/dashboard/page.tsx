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

  // This logic ensures users go to THEIR page, not the Admin page
  const routes: Record<string, string> = {
    "super_admin": "/dashboard/admin",
    "administrator": "/dashboard/admin",
    "chairperson": "/dashboard/approvals",
    "union_rep": "/dashboard/employees",
    "fund_manager": "/dashboard/ledger",
    "employee": "/dashboard/profile",
  };

  const destination = routes[role || ""] || "/login";
  redirect(destination);
}
