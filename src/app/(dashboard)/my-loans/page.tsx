import { MyLoansClient } from "@/features/pages/MyLoansClient";
import { fetchMyLoansData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Loans" };

export default async function MyLoansPage() {
  const data = await fetchMyLoansData();
  return <MyLoansClient {...data} />;
}
