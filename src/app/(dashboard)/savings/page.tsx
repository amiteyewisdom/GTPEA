import { createClient } from "@/lib/supabase/server";
import type { Savings } from "@/types/database";
import { SavingsClient } from "@/features/savings/SavingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Savings" };

export default async function SavingsPage() {
  const supabase = await createClient();

  const { data: savings, count } = await supabase
    .from("savings")
    .select(
      `*, employees (first_name, last_name, employee_no, department)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  const typedSavings = savings as Savings[] | null;

  const totalBalance = typedSavings?.reduce((sum, s) => sum + (s.balance ?? 0), 0) ?? 0;

  return <SavingsClient savings={typedSavings ?? []} total={count ?? 0} totalBalance={totalBalance} />;
}
