import { createClient } from "@/lib/supabase/server";
import { LedgerClient } from "@/features/ledger/LedgerClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ledger" };

export default async function LedgerPage() {
  const supabase = await createClient();

  const { data: ledgerEntries, count } = await supabase
    .from("ledger_entries")
    .select(
      `*, employees (first_name, last_name, employee_no)`,
      { count: "exact" }
    )
    .order("posted_at", { ascending: false })
    .limit(100);

  return <LedgerClient ledgerEntries={ledgerEntries ?? []} total={count ?? 0} />;
}
