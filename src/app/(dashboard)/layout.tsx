import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { redirect } from "next/navigation";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { UserRole } from "@/lib/role-menus";

const APPROVER_ROLES = ["union_rep", "fund_manager", "chairperson", "administrator"];

const STAGE_FOR_ROLE: Record<string, number> = {
  union_rep: 1,
  fund_manager: 2,
  chairperson: 3,
};

async function fetchPendingCount(supabase: any, role: string): Promise<number> {
  if (!APPROVER_ROLES.includes(role)) return 0;
  try {
    const query = supabase
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    const stage = STAGE_FOR_ROLE[role];
    if (stage) query.eq("current_stage", stage);
    const { count } = await query;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const profileRes = await supabase
      .from("profiles")
      .select("full_name, role, avatar_url")
      .eq("user_id", user.id)
      .single();
    const profile = profileRes.data as Profile | null;
    const role = profile?.role ?? "employee";

    const pendingCount = await fetchPendingCount(supabase, role);

    return (
      <EnterpriseLayout
        currentRole={(role as UserRole) || "employee"}
        userName={profile?.full_name ?? user.email ?? "User"}
        pendingCount={pendingCount}
      >
        {children}
      </EnterpriseLayout>
    );
  } catch (error) {
    console.error('Dashboard layout error:', error);
    redirect("/login");
  }
}
