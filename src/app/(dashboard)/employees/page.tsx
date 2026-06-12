import { createClient } from "@/lib/supabase/server";
import { EmployeesClient } from "@/features/employees/EmployeesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const supabase = await createClient();

  const { data: employees, count } = await supabase
    .from("employees")
    .select("*", { count: "exact" })
    .not("email", "eq", "superadmin@gtpea.com")
    .order("created_at", { ascending: false });

  return <EmployeesClient employees={employees ?? []} total={count ?? 0} />;
}
