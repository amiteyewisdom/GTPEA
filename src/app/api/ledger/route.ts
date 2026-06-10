// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const accountType = searchParams.get("account_type");
  const limit = Number(searchParams.get("limit")) || 100;

  let query = supabase
    .from("ledger_entries")
    .select("*, employees (first_name, last_name, employee_no)")
    .order("posted_at", { ascending: false })
    .limit(limit);

  if (accountType) {
    query = query.eq("account_type", accountType);
  }

  const { data: ledgerEntries, count } = await query;

  return NextResponse.json({ ledgerEntries: ledgerEntries ?? [], total: count ?? 0 });
}
