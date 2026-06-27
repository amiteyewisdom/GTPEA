import { FinancialOverviewClient } from "@/features/pages/FinancialOverviewClient";
import { fetchFinancialOverview } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Financial Overview" };
export const dynamic = "force-dynamic";

export default async function FinancialOverviewPage() {
  const data = await fetchFinancialOverview();
  return <FinancialOverviewClient {...data} />;
}
