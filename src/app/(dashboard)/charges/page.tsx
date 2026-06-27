import { createClient } from "@/lib/supabase/server";
import { ChargesClient } from "@/features/charges/ChargesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Member Charges" };
export const dynamic = "force-dynamic";

export default async function ChargesPage() {
  const supabase = await createClient();

  const [chargesRes, employeesRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, employees(first_name, last_name, employee_no)")
      .in("type", ["fee", "penalty"])
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("employees")
      .select("id, first_name, last_name, employee_no")
      .eq("status", "active")
      .order("first_name"),
  ]);

  return (
    <ChargesClient
      charges={(chargesRes.data ?? []) as any}
      employees={(employeesRes.data ?? []) as any}
    />
  );
}
