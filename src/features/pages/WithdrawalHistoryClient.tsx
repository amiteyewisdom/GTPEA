"use client";

import GlassCard from "@/components/ui/GlassCard";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ArrowUpCircle } from "lucide-react";

export function WithdrawalHistoryClient({
  totalWithdrawals,
  thisMonth,
  withdrawals,
}: {
  totalWithdrawals: number;
  thisMonth: number;
  withdrawals: any[];
}) {
  return (
    <SearchableList
      title="Withdrawal History"
      subtitle="View your withdrawal transactions"
      searchPlaceholder="Search withdrawals..."
      emptyMessage="No withdrawal transactions found."
      stats={
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <GlassCard className="p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-brand-card-bg p-3 text-brand-danger">
                <ArrowUpCircle className="h-5 w-5" />
              </div>
              <span className="text-sm text-brand-text-secondary">Total Withdrawals</span>
            </div>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalWithdrawals)}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-brand-card-bg p-3 text-brand-accent">
                <ArrowUpCircle className="h-5 w-5" />
              </div>
              <span className="text-sm text-brand-text-secondary">This Month</span>
            </div>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(thisMonth)}</p>
          </GlassCard>
        </div>
      }
      items={withdrawals.map((item) => ({
        id: item.id,
        searchText: `${item.request_ref} ${item.reason ?? ""} ${item.status}`,
        content: (
          <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
            <ArrowUpCircle className="h-5 w-5 text-brand-danger" />
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-text">{item.request_ref}</p>
              <p className="text-xs text-brand-text-secondary">
                {formatCurrency(item.amount)} · {item.status}
              </p>
            </div>
            <p className="text-xs text-brand-text-secondary">{formatDate(item.requested_at)}</p>
          </div>
        ),
      }))}
    />
  );
}
