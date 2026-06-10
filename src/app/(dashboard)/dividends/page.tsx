import { createClient } from "@/lib/supabase/server";
import { DividendsClient } from "@/features/dividends/DividendsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dividends" };

export default async function DividendsPage() {
  const supabase = await createClient();

  const [configsRes, dividendsRes] = await Promise.all([
    supabase
      .from("dividend_configs")
      .select("*")
      .order("fiscal_year", { ascending: false }),
    supabase
      .from("dividends")
      .select("*, employees (first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const configs = configsRes.data ?? [];
  const recentDividends = dividendsRes.data ?? [];

  return <DividendsClient configs={configs} recentDividends={recentDividends} />;
}
