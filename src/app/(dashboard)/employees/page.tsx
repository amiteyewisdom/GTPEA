import { createClient } from "@/lib/supabase/server";
import { EmployeesClient } from "@/features/employees/EmployeesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const supabase = await createClient();

  // Only show accounts whose profile role is 'employee' (exclude admin/management accounts)
  const { data: employeeProfiles } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("role", "employee");

  const employeeIds = (employeeProfiles ?? [])
    .map((p: any) => p.employee_id)
    .filter(Boolean) as string[];

  const { data: employees, count } =
    employeeIds.length > 0
      ? await supabase
          .from("employees")
          .select("*", { count: "exact" })
          .in("id", employeeIds)
          .order("created_at", { ascending: false })
      : { data: [], count: 0 };

  return <EmployeesClient employees={employees ?? []} total={count ?? 0} />;
}
