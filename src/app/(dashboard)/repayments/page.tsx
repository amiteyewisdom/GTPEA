import { RepaymentsClient } from "@/features/pages/RepaymentsClient";
import { fetchRepaymentsData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Repayments" };

export default async function RepaymentsPage() {
  const { repayments, loans } = await fetchRepaymentsData();
  return <RepaymentsClient repayments={repayments} loans={loans} />;
}
