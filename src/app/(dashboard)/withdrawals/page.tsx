import { createClient } from "@/lib/supabase/server";
import { WithdrawalsClient } from "@/features/withdrawals/WithdrawalsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Withdrawals" };

export default async function WithdrawalsPage() {
  const supabase = await createClient();

  const { data: withdrawals, count } = await supabase
    .from("withdrawal_requests")
    .select(
      `*, employees (first_name, last_name, employee_no), savings (account_number, type)`,
      { count: "exact" }
    )
    .order("requested_at", { ascending: false });

  return <WithdrawalsClient withdrawals={withdrawals ?? []} total={count ?? 0} />;
}
