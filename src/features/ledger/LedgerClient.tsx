"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

const ACCOUNT_BADGE: Record<string, string> = {
  savings:        "bg-indigo-100 text-indigo-700",
  loan:           "bg-amber-100 text-amber-700",
  loan_repayment: "bg-green-100 text-green-700",
  withdrawal:     "bg-red-100 text-red-700",
  interest:       "bg-cyan-100 text-cyan-700",
  dividend:       "bg-teal-100 text-teal-700",
  penalty:        "bg-orange-100 text-orange-700",
  fee:            "bg-slate-100 text-slate-600",
};

const FILTER_ACTIVE = "bg-brand-green text-white border-brand-green";
const FILTER_IDLE   = "border border-brand-card-border bg-white text-brand-text-secondary hover:bg-brand-hover";

interface LedgerEntry {
  id: string;
  account_type: string;
  debit: number;
  credit: number;
  running_balance: number;
  narration: string;
  reference: string;
  period_year: number;
  period_month: number;
  posted_at: string;
  employees?: { first_name: string; last_name: string; employee_no: string } | null;
}

interface LedgerClientProps {
  ledgerEntries: LedgerEntry[];
  total: number;
}

export function LedgerClient({ ledgerEntries, total }: LedgerClientProps) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const filteredEntries = selectedAccount
    ? ledgerEntries.filter((e) => e.account_type === selectedAccount)
    : ledgerEntries;

  const presentTypes = Array.from(new Set(ledgerEntries.map((e) => e.account_type)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-brand-text">Ledger / Transactions Center</h2>
        <span className="text-sm text-brand-text-secondary">{total} entries</span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedAccount(null)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${selectedAccount === null ? FILTER_ACTIVE : FILTER_IDLE}`}
        >
          All
        </button>
        {presentTypes.map((k) => (
          <button
            key={k}
            onClick={() => setSelectedAccount(k)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${selectedAccount === k ? FILTER_ACTIVE : FILTER_IDLE}`}
          >
            {k.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-brand border border-brand-card-border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-brand-card-border bg-brand-card-bg">
              {["Reference", "Account", "Narration", "Debit", "Credit", "Balance", "Period"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-card-border">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-brand-text-secondary">
                  No ledger entries found
                </td>
              </tr>
            ) : filteredEntries.map((r) => (
              <tr key={r.id} className="hover:bg-brand-hover transition-colors">
                <td className="px-4 py-3 font-semibold text-brand-text whitespace-nowrap">{r.reference}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${ACCOUNT_BADGE[r.account_type] ?? "bg-slate-100 text-slate-600"}`}>
                    {r.account_type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-text-secondary max-w-xs truncate">{r.narration}</td>
                <td className="px-4 py-3 font-medium text-red-600 whitespace-nowrap">
                  {r.debit > 0 ? formatCurrency(r.debit) : "—"}
                </td>
                <td className="px-4 py-3 font-medium text-green-600 whitespace-nowrap">
                  {r.credit > 0 ? formatCurrency(r.credit) : "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-brand-text whitespace-nowrap">
                  {formatCurrency(r.running_balance)}
                </td>
                <td className="px-4 py-3 text-brand-text-secondary whitespace-nowrap">
                  {r.period_year}-{String(r.period_month).padStart(2, "0")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
