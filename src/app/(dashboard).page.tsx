// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the role from your Supabase 'profiles' table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = profile?.role;

  // This is the "Switchboard" logic
  if (role === "super_admin" || role === "administrator") {
    redirect("/dashboard/admin");
  } 
  else if (role === "chairperson") {
    redirect("/dashboard/approvals");
  } 
  else if (role === "union_rep") {
    redirect("/dashboard/employees");
  } 
  else if (role === "fund_manager") {
    redirect("/dashboard/ledger");
  } 
  else if (role === "employee") {
    redirect("/dashboard/profile");
  } 
  else {
    // If they have no role or a typo, don't show them admin!
    redirect("/login?error=unauthorized");
  }
}
