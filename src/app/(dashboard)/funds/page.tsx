import { FundsClient } from "@/features/pages/FundsClient";
import { fetchFundsData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Funds Management" };

export default async function FundsPage() {
  const data = await fetchFundsData();
  return <FundsClient {...data} />;
}
