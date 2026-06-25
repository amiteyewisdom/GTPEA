import { createClient } from "@/lib/supabase/server";
import { ExpensesClient } from "@/features/expenses/ExpensesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Expenses" };
export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const supabase = await createClient();

  let expenses: any[] = [];
  try {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false })
      .limit(200);
    expenses = data ?? [];
  } catch {
    expenses = [];
  }

  return <ExpensesClient expenses={expenses} />;
}
