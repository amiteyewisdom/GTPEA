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
  if (role === 'super_admin' || role === 'administrator') redirect("/admin");
  if (role === 'chairperson') redirect("/chair");
  if (role === 'union_rep') redirect("/union");
  if (role === 'fund_manager') redirect("/fund");
  if (role === 'employee') redirect("/employee");

  redirect("/dashboard");
    }
