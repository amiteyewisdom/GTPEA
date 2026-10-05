import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";
import { redirect } from "next/navigation";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { UserRole } from "@/lib/role-menus";

const APPROVER_ROLES = ["union_rep", "fund_manager", "chairperson"];

const STAGE_FOR_ROLE: Record<string, number> = {
  fund_manager: 1,
  chairperson: 2,
  union_rep: 3,
};

async function fetchPendingCount(supabase: any, role: string): Promise<number> {
  if (!APPROVER_ROLES.includes(role)) return 0;
  try {
    const stage = STAGE_FOR_ROLE[role];

    // Loan approvals: pending at this role's stage
    const loanQuery = supabase
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("entity_type", "loan")
      .eq("current_stage", stage);
    const { count: loanCount } = await loanQuery;

    // Withdrawal approvals are a single-stage fund-manager flow (always stage 1)
    let withdrawalCount = 0;
    if (role === "fund_manager") {
      const { count } = await supabase
        .from("approvals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("entity_type", "withdrawal");
      withdrawalCount = count ?? 0;
    }

    return (loanCount ?? 0) + withdrawalCount;
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
      .select("full_name, role, avatar_url, employee_id")
      .eq("user_id", user.id)
      .single();
    
    if (profileRes.error) {
      console.error('Dashboard layout - profile error:', profileRes.error);
      // Don't redirect on profile error, use defaults
    }
    
    const profile = profileRes.data as Profile | null;
    const role = profile?.role ?? "employee";

    // For employees, get their name from employees table if profile doesn't have it
    let userName = profile?.full_name ?? user.email ?? "User";
    const employeeRef = profile?.employee_id;
    if (role === "employee" && (!profile?.full_name || profile?.full_name === "User") && employeeRef) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employeeRef);
      const { data: employee } = await (createAdminClient()
        .from("employees") as any)
        .select("first_name, last_name")
        .eq(isUuid ? "id" : "employee_no", employeeRef)
        .maybeSingle();
      if (employee?.first_name) {
        userName = `${employee.first_name} ${employee.last_name ?? ""}`.trim();
      }
    }

    const pendingCount = await fetchPendingCount(supabase, role);

    return (
      <EnterpriseLayout
        currentRole={(role as UserRole) || "employee"}
        userName={userName}
        avatarUrl={profile?.avatar_url}
        pendingCount={pendingCount}
      >
        {children}
      </EnterpriseLayout>
    );
  } catch (error: any) {
    // Don't log redirect errors - they're expected Next.js behavior
    if (!error?.digest?.startsWith('NEXT_REDIRECT')) {
      console.error('Dashboard layout error:', error);
    }
    redirect("/login");
  }
}
