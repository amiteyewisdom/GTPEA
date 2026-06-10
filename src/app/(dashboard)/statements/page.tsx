import { createClient } from "@/lib/supabase/server";
import { StatementsClient } from "@/features/statements/StatementsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statements" };

export default async function StatementsPage() {
  const supabase = await createClient();

  const { data: statements, count } = await supabase
    .from("statement_requests")
    .select(
      `*, employees (first_name, last_name, employee_no)`,
      { count: "exact" }
    )
    .order("requested_at", { ascending: false });

  return <StatementsClient statements={statements ?? []} total={count ?? 0} />;
}
