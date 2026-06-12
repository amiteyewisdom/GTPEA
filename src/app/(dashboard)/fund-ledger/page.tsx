import { createClient } from "@/lib/supabase/server";
import { LedgerClient } from "@/features/ledger/LedgerClient";
import { fetchLedgerSummary } from "@/lib/data/page-data";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatters";
import { Minus, Plus, BadgeCent } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fund Ledger" };

export default async function FundLedgerPage() {
  const supabase = await createClient();
  const [summary, ledgerRes] = await Promise.all([
    fetchLedgerSummary(),
    supabase
      .from("ledger_entries")
      .select(`*, employees (first_name, last_name, employee_no)`, { count: "exact" })
      .order("posted_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Fund Ledger</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Complete record of fund transactions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <GlassCard className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-card-bg p-3 text-brand-success">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-sm text-brand-text-secondary">Total Credits</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(summary.totalCredits)}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-card-bg p-3 text-brand-danger">
              <Minus className="h-5 w-5" />
            </div>
            <span className="text-sm text-brand-text-secondary">Total Debits</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(summary.totalDebits)}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-card-bg p-3 text-brand-accent">
              <BadgeCent className="h-5 w-5" />
            </div>
            <span className="text-sm text-brand-text-secondary">Current Balance</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(summary.currentBalance)}</p>
        </GlassCard>
      </div>

      <LedgerClient ledgerEntries={ledgerRes.data ?? []} total={ledgerRes.count ?? 0} />
    </div>
  );
}
