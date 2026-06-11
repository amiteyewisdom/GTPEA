import { createClient } from "@/lib/supabase/server";
import { fetchImportHistory } from "@/lib/imports/log-import";
import DataImportsClient from "@/features/data-imports/DataImportsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Data Imports" };

export default async function DataImportsPage() {
  const supabase = await createClient();
  const history = await fetchImportHistory(supabase);

  return <DataImportsClient initialHistory={history} />;
}
