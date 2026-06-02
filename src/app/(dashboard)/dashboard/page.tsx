import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = profile?.role?.trim();

  const routes: Record<string, string> = {
    super_admin: "/dashboard",
    administrator: "/dashboard",
    chairperson: "/dashboard/approvals",
    union_rep: "/dashboard/employees",
    fund_manager: "/dashboard/ledger",
    employee: "/dashboard/profile",
  };

  const route = role ? routes[role] : null;

  if (!route) {
    redirect("/login");
  }

  redirect(route);
}
