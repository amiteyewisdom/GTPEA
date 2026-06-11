"use client";

import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatters";
import { DollarSign, PiggyBank, TrendingUp, Wallet } from "lucide-react";

export function FinancialOverviewClient({
  totalAssets,
  totalLiabilities,
  netIncome,
  growthRate,
  breakdown,
}: {
  totalAssets: number;
  totalLiabilities: number;
  netIncome: number;
  growthRate: number;
  breakdown: { label: string; amount: number; percent: number; color: string }[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Financial Overview</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Comprehensive financial performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Wallet} label="Total Assets" value={formatCurrency(totalAssets)} />
        <MetricCard icon={PiggyBank} label="Total Liabilities" value={formatCurrency(totalLiabilities)} />
        <MetricCard icon={DollarSign} label="Net Position" value={formatCurrency(netIncome)} />
        <MetricCard icon={TrendingUp} label="Savings Growth" value={`${growthRate.toFixed(1)}%`} />
      </div>

      <GlassCard className="p-6">
        <h3 className="mb-4 text-xl font-semibold text-brand-text">Revenue Breakdown</h3>
        <div className="space-y-4">
          {breakdown.length === 0 ? (
            <p className="text-sm text-brand-text-secondary">No revenue transactions recorded yet.</p>
          ) : (
            breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-brand-card-bg p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="font-medium text-brand-text">{item.label}</span>
                </div>
                <span className="font-bold text-brand-text">
                  {item.percent}% · {formatCurrency(item.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-brand-card-bg p-3 text-brand-accent">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="mb-1 text-sm text-brand-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
    </GlassCard>
  );
}
