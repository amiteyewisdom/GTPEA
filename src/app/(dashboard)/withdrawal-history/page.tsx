import { WithdrawalHistoryClient } from "@/features/pages/WithdrawalHistoryClient";
import { fetchWithdrawalHistoryData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Partial Withdrawals" };

export default async function WithdrawalHistoryPage() {
  const data = await fetchWithdrawalHistoryData();
  return <WithdrawalHistoryClient {...data} />;
}
