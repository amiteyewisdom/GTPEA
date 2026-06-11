"use client";

import GlassCard from "@/components/ui/GlassCard";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PiggyBank, Plus } from "lucide-react";

export function SavingsHistoryClient({
  totalSavings,
  thisMonth,
  contributions,
}: {
  totalSavings: number;
  thisMonth: number;
  contributions: any[];
}) {
  return (
    <SearchableList
      title="Savings History"
      subtitle="View your savings contributions"
      searchPlaceholder="Search transactions..."
      emptyMessage="No savings contributions found."
      stats={
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <GlassCard className="p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-brand-card-bg p-3 text-brand-success">
                <PiggyBank className="h-5 w-5" />
              </div>
              <span className="text-sm text-brand-text-secondary">Total Savings</span>
            </div>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalSavings)}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-brand-card-bg p-3 text-brand-accent">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm text-brand-text-secondary">This Month</span>
            </div>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(thisMonth)}</p>
          </GlassCard>
        </div>
      }
      items={contributions.map((item) => ({
        id: item.id,
        searchText: `${item.reference} ${item.contribution_type} ${item.narration ?? ""}`,
        content: (
          <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
            <PiggyBank className="h-5 w-5 text-brand-success" />
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-text">{formatCurrency(item.amount)}</p>
              <p className="text-xs capitalize text-brand-text-secondary">
                {item.contribution_type} · {item.reference}
              </p>
            </div>
            <p className="text-xs text-brand-text-secondary">{formatDate(item.created_at)}</p>
          </div>
        ),
      }))}
    />
  );
}
