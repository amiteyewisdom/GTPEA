import { createClient } from "@/lib/supabase/server";

const IMPORT_ROLES = ["fund_manager", "super_admin", "administrator", "chairperson"] as const;
const REPORT_ROLES = [...IMPORT_ROLES, "union_rep"] as const;

export type StaffRole = (typeof IMPORT_ROLES)[number] | "union_rep" | "employee";

export async function getStaffUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null as StaffRole | null };
  }

  const profileRes = await (supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single() as any);

  return {
    supabase,
    user,
    role: (profileRes.data?.role ?? "employee") as StaffRole,
  };
}

export function canImport(role: StaffRole | null) {
  return role !== null && IMPORT_ROLES.includes(role as (typeof IMPORT_ROLES)[number]);
}

export function canExportReports(role: StaffRole | null) {
  return role !== null && REPORT_ROLES.includes(role as (typeof REPORT_ROLES)[number]);
}
