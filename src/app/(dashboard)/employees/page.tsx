import { createClient } from "@/lib/supabase/server";
import { EmployeesClient } from "@/features/employees/EmployeesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const supabase = await createClient();

  // Show all staff except those linked to super admin profiles. Board roles
  // (fund_manager, chairperson, union_rep, administrator) are still staff —
  // "administrator" is an assignable board role, so only super_admin is
  // treated as a system account here.
  const { data: nonEmployeeProfiles } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("role", "super_admin")
    .not("employee_id", "is", null);

  const excludedIds = new Set(
    (nonEmployeeProfiles ?? []).map((p: any) => p.employee_id).filter(Boolean)
  );

  const { data: employees, count } = await supabase
    .from("employees")
    .select("*", { count: "exact" })
    .not("employee_no", "in", "(ADMIN001,ADMIN002)")
    .order("created_at", { ascending: false });

  const filteredEmployees = (employees ?? []).filter((e: any) => !excludedIds.has(e.id));

  return <EmployeesClient employees={filteredEmployees} total={filteredEmployees.length} />;
}
