import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { redirect } from "next/navigation";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { UserRole } from "@/lib/role-menus";

const APPROVER_ROLES = ["union_rep", "fund_manager", "chairperson", "administrator"];

async function fetchPendingCount(supabase: any, role: string): Promise<number> {
  if (!APPROVER_ROLES.includes(role)) return 0;
  try {
    const { count } = await supabase
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
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
