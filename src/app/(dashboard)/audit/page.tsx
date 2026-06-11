import { AuditClient } from "@/features/pages/AuditClient";
import { fetchAuditLogsData } from "@/lib/data/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditPage() {
  const { logs } = await fetchAuditLogsData();
  return <AuditClient logs={logs} />;
}
