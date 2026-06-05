import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleDashboard } from "@/features/dashboard/RoleDashboard";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fix: use 'as any' to bypass the 'never' type error
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, employee_id")
    .eq("user_id", user.id)
    .single() as any;

  if (!profile) redirect("/login");

  // Fetch Global Metrics for Admin/Chairman/Fund Manager
  const [empCount, loanData, approvalCount] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("loans").select("outstanding_balance, amount_requested"),
    supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending")
  ]);

  const metrics = {
    totalMembers: empCount.count ?? 0,
    totalOutstanding: loanData.data?.reduce((s, l) => s + (l.outstanding_balance ?? 0), 0) ?? 0,
    pendingApprovals: approvalCount.count ?? 0,
    fundBalance: 42850000,
    dividends: 154000,
    withdrawals: 8500
  };

  return <RoleDashboard user={profile} metrics={metrics} />;
}