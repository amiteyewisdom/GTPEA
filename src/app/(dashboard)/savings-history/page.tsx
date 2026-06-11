import { SavingsHistoryClient } from "@/features/pages/SavingsHistoryClient";
import { fetchSavingsHistoryData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Savings History" };

export default async function SavingsHistoryPage() {
  const data = await fetchSavingsHistoryData();
  return <SavingsHistoryClient {...data} />;
}
