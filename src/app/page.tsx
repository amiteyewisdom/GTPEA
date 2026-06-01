import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // DEBUG: Show role on screen instead of redirect
  if (error) return <div>Supabase Error: {error.message}</div>;
  if (!profile) return <div>No profile found for user ID: {user.id}</div>;
  
  return <div>Your role is: "{profile.role}". Click <a href="/dashboard">here</a> to continue</div>;

  // Delete the code above after we confirm the role
  // const role = profile.role;
  // if (role === "super_admin" || role === "administrator") redirect("/dashboard");
  // if (role === "chairperson") redirect("/dashboard/approvals");
  // if (role === "union_rep") redirect("/dashboard/employees");
  // if (role === "fund_manager") redirect("/dashboard/ledger");
  // if (role === "employee") redirect("/dashboard/profile");
  // redirect("/dashboard");
}
