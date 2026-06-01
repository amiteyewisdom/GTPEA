import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  
  const { data: { user } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get role from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    redirect("/dashboard");
  }

  const role = profile.role;

  // Map your Supabase roles to routes
  if (role === 'super_admin' || role === 'administrator) redirect("/dashboard");
  if (role === 'chairperson') redirect("dashboard/approvals");
  if (role === 'union_rep') redirect("dashboard/employees");
  if (role === 'fund_manager') redirect("/dashobard/ledger");
  if (role === 'employee') redirect("dashboard/profile");

  redirect("/dashboard");
    }
