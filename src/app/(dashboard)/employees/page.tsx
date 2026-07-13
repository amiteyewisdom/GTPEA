import { createClient } from "@/lib/supabase/server";
import { EmployeesClient } from "@/features/employees/EmployeesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const supabase = await createClient();

  // Show all employees except those linked to admin/rep/manager profiles.
  const { data: nonEmployeeProfiles } = await supabase
    .from("profiles")
    .select("employee_id")
    .neq("role", "employee")
    .not("employee_id", "is", null);

  const excludedIds = new Set(
    (nonEmployeeProfiles ?? []).map((p: any) => p.employee_id).filter(Boolean)
  );

  const { data: employees, count } = await supabase
    .from("employees")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const filteredEmployees = (employees ?? []).filter((e: any) => !excludedIds.has(e.id));

  return <EmployeesClient employees={filteredEmployees} total={filteredEmployees.length} />;
}
