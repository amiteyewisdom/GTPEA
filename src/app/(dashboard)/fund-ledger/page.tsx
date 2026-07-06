import { createClient } from "@/lib/supabase/server";
import { LedgerClient } from "@/features/ledger/LedgerClient";
import { fetchLedgerSummary } from "@/lib/data/page-data";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatters";
import { Minus, Plus, BadgeCent } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fund Ledger" };
export const dynamic = "force-dynamic";

export default async function FundLedgerPage() {
  const supabase = await createClient();

  const [summary, loansRes, contributionsRes, repaymentsRes] = await Promise.all([
    fetchLedgerSummary(),
    supabase
      .from("loans")
      .select("id, loan_ref, amount_approved, amount_requested, amount_disbursed, status, created_at, employees!employee_id(first_name, last_name, employee_no)")
      .in("status", ["approved", "disbursed", "repaying", "completed"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("savings_contributions")
      .select("id, amount, period_year, period_month, created_at, employees!employee_id(first_name, last_name, employee_no)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("repayments")
      .select("id, amount_paid, amount_due, due_date, status, created_at, employees!employee_id(first_name, last_name, employee_no)")
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Build synthetic ledger rows from real data
  type SyntheticRow = {
    id: string; account_type: string; debit: number; credit: number;
    running_balance: number; narration: string; reference: string;
    period_year: number; period_month: number; posted_at: string;
    employees?: { first_name: string; last_name: string; employee_no: string } | null;
  };

  const loanRows: SyntheticRow[] = (loansRes.data ?? []).map((l: any) => {
    const amount = Number(l.amount_disbursed) || Number(l.amount_approved) || Number(l.amount_requested) || 0;
    const d = new Date(l.created_at);
    return {
      id: l.id, account_type: "loan", debit: amount, credit: 0, running_balance: 0,
      narration: `Loan disbursement — ${l.loan_ref || l.id.slice(0, 8)}`,
      reference: l.loan_ref || l.id.slice(0, 8).toUpperCase(),
      period_year: d.getFullYear(), period_month: d.getMonth() + 1,
      posted_at: l.created_at, employees: l.employees ?? null,
    };
  });

  const savingsRows: SyntheticRow[] = (contributionsRes.data ?? []).map((c: any) => {
    const d = new Date(c.created_at);
    return {
      id: c.id, account_type: "savings", debit: 0, credit: Number(c.amount) || 0, running_balance: 0,
      narration: `Savings contribution — ${c.period_year}-${String(c.period_month).padStart(2, "0")}`,
      reference: `SAV-${c.id.slice(0, 8).toUpperCase()}`,
      period_year: c.period_year, period_month: c.period_month,
      posted_at: c.created_at, employees: c.employees ?? null,
    };
  });

  const repaymentRows: SyntheticRow[] = (repaymentsRes.data ?? []).map((r: any) => {
    const d = new Date(r.created_at || r.due_date);
    return {
      id: r.id, account_type: "loan_repayment", debit: 0, credit: Number(r.amount_paid) || Number(r.amount_due) || 0, running_balance: 0,
      narration: `Loan repayment`,
      reference: `REP-${r.id.slice(0, 8).toUpperCase()}`,
      period_year: d.getFullYear(), period_month: d.getMonth() + 1,
      posted_at: r.created_at || r.due_date, employees: r.employees ?? null,
    };
  });

  // Sort all entries by date descending and compute running balance
  const allRows = [...loanRows, ...savingsRows, ...repaymentRows]
    .sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

  let running = summary.currentBalance;
  const ledgerEntries = allRows.map((row) => {
    const entry = { ...row, running_balance: running };
    running -= (row.credit - row.debit);
    return entry;
  });

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

      <LedgerClient ledgerEntries={ledgerEntries} total={ledgerEntries.length} />
    </div>
  );
}
