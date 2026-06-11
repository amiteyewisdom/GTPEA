import { DisbursementsClient } from "@/features/pages/DisbursementsClient";
import { fetchDisbursementsData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disbursements" };

export default async function DisbursementsPage() {
  const { disbursements } = await fetchDisbursementsData();
  return <DisbursementsClient disbursements={disbursements} />;
}
