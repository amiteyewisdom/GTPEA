import { createClient } from "@/lib/supabase/server";
import { LedgerClient } from "@/features/ledger/LedgerClient";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatters";
import { Minus, Plus, BadgeCent } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fund Ledger" };
export const dynamic = "force-dynamic";

export default async function FundLedgerPage() {
  const supabase = await createClient();

  // Exclude transactions tied to admin/rep/manager employee accounts
  const { data: employeeProfiles } = await supabase
    .from("profiles")
    .select("employee_id, role")
    .not("employee_id", "is", null);

  const excludedEmployeeIds = new Set(
    ((employeeProfiles ?? []) as any[])
      .filter((p) => p.role !== "employee")
      .map((p) => p.employee_id)
      .filter(Boolean)
  );

  const [loansRes, contributionsRes, repaymentsRes, withdrawalsRes, dividendsRes, transactionsRes] = await Promise.all([
    supabase
      .from("loans")
      .select("id, employee_id, loan_ref, amount_approved, amount_requested, amount_disbursed, status, created_at, employees!employee_id(first_name, last_name, employee_no)")
      .in("status", ["approved", "disbursed", "repaying", "completed"])
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("savings_contributions")
      .select("id, employee_id, amount, period_year, period_month, created_at, employees!employee_id(first_name, last_name, employee_no)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("repayments")
      .select("id, employee_id, amount_paid, amount_due, due_date, status, created_at, employees!employee_id(first_name, last_name, employee_no)")
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("withdrawal_requests")
      .select("id, employee_id, request_ref, amount, status, requested_at, disbursement_date, employees!employee_id(first_name, last_name, employee_no)")
      .in("status", ["approved", "disbursed"])
      .order("requested_at", { ascending: false })
      .limit(50),
    supabase
      .from("dividends")
      .select("id, employee_id, dividend_amount, credited_at, employees!employee_id(first_name, last_name, employee_no)")
      .not("credited_at", "is", null)
      .order("credited_at", { ascending: false })
      .limit(50),
    supabase
      .from("transactions")
      .select("id, employee_id, reference, amount, type, description, created_at, employees!employee_id(first_name, last_name, employee_no)")
      .in("type", ["fee", "penalty", "interest"])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Build synthetic ledger rows from real data
  type SyntheticRow = {
    id: string; employee_id: string; account_type: string; debit: number; credit: number;
    running_balance: number; narration: string; reference: string;
    period_year: number; period_month: number; posted_at: string;
    employees?: { first_name: string; last_name: string; employee_no: string } | null;
  };

  const loanRows: SyntheticRow[] = (loansRes.data ?? []).map((l: any) => {
    const amount = Number(l.amount_disbursed) || Number(l.amount_approved) || Number(l.amount_requested) || 0;
    const d = new Date(l.created_at);
    return {
      id: l.id, employee_id: l.employee_id, account_type: "loan", debit: amount, credit: 0, running_balance: 0,
      narration: `Loan disbursement — ${l.loan_ref || l.id.slice(0, 8)}`,
      reference: l.loan_ref || l.id.slice(0, 8).toUpperCase(),
      period_year: d.getFullYear(), period_month: d.getMonth() + 1,
      posted_at: l.created_at, employees: l.employees ?? null,
    };
  });

  const savingsRows: SyntheticRow[] = (contributionsRes.data ?? []).map((c: any) => {
    const d = new Date(c.created_at);
    return {
      id: c.id, employee_id: c.employee_id, account_type: "savings", debit: 0, credit: Number(c.amount) || 0, running_balance: 0,
      narration: `Savings contribution — ${c.period_year}-${String(c.period_month).padStart(2, "0")}`,
      reference: `SAV-${c.id.slice(0, 8).toUpperCase()}`,
      period_year: c.period_year, period_month: c.period_month,
      posted_at: c.created_at, employees: c.employees ?? null,
    };
  });

  const repaymentRows: SyntheticRow[] = (repaymentsRes.data ?? []).map((r: any) => {
    const d = new Date(r.created_at || r.due_date);
    return {
      id: r.id, employee_id: r.employee_id, account_type: "loan_repayment", debit: 0, credit: Number(r.amount_paid) || Number(r.amount_due) || 0, running_balance: 0,
      narration: `Loan repayment`,
      reference: `REP-${r.id.slice(0, 8).toUpperCase()}`,
      period_year: d.getFullYear(), period_month: d.getMonth() + 1,
      posted_at: r.created_at || r.due_date, employees: r.employees ?? null,
    };
  });

  const withdrawalRows: SyntheticRow[] = (withdrawalsRes.data ?? []).map((w: any) => {
    const d = new Date(w.disbursement_date || w.requested_at);
    return {
      id: w.id, employee_id: w.employee_id, account_type: "withdrawal", debit: Number(w.amount) || 0, credit: 0, running_balance: 0,
      narration: `Withdrawal — ${w.request_ref || w.id.slice(0, 8)}`,
      reference: w.request_ref || `WTH-${w.id.slice(0, 8).toUpperCase()}`,
      period_year: d.getFullYear(), period_month: d.getMonth() + 1,
      posted_at: w.disbursement_date || w.requested_at, employees: w.employees ?? null,
    };
  });

  const dividendRows: SyntheticRow[] = (dividendsRes.data ?? []).map((d: any) => {
    const date = new Date(d.credited_at);
    return {
      id: d.id, employee_id: d.employee_id, account_type: "dividend", debit: 0, credit: Number(d.dividend_amount) || 0, running_balance: 0,
      narration: `Dividend credit`,
      reference: `DIV-${d.id.slice(0, 8).toUpperCase()}`,
      period_year: date.getFullYear(), period_month: date.getMonth() + 1,
      posted_at: d.credited_at, employees: d.employees ?? null,
    };
  });

  const transactionRows: SyntheticRow[] = (transactionsRes.data ?? []).map((t: any) => {
    const d = new Date(t.created_at);
    const isCredit = t.type === "interest";
    return {
      id: t.id, employee_id: t.employee_id, account_type: t.type === "interest" ? "interest" : t.type === "fee" ? "fee" : "penalty",
      debit: isCredit ? 0 : Number(t.amount) || 0,
      credit: isCredit ? Number(t.amount) || 0 : 0,
      running_balance: 0,
      narration: t.description || `${t.type} — ${t.reference || t.id.slice(0, 8)}`,
      reference: t.reference || `TXN-${t.id.slice(0, 8).toUpperCase()}`,
      period_year: d.getFullYear(), period_month: d.getMonth() + 1,
      posted_at: t.created_at, employees: t.employees ?? null,
    };
  });

  // Sort all entries by date descending and compute running balance
  const allRows = [...loanRows, ...savingsRows, ...repaymentRows, ...withdrawalRows, ...dividendRows, ...transactionRows]
    .filter((row) => !excludedEmployeeIds.has(row.employee_id))
    .sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());

  const totalCredits = allRows.reduce((sum, row) => sum + row.credit, 0);
  const totalDebits = allRows.reduce((sum, row) => sum + row.debit, 0);
  const currentBalance = totalCredits - totalDebits;

  let running = currentBalance;
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
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalCredits)}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-card-bg p-3 text-brand-danger">
              <Minus className="h-5 w-5" />
            </div>
            <span className="text-sm text-brand-text-secondary">Total Debits</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalDebits)}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-card-bg p-3 text-brand-accent">
              <BadgeCent className="h-5 w-5" />
            </div>
            <span className="text-sm text-brand-text-secondary">Current Balance</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(currentBalance)}</p>
        </GlassCard>
      </div>

      <LedgerClient ledgerEntries={ledgerEntries} total={ledgerEntries.length} />
    </div>
  );
}
