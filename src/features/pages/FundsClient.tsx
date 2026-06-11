"use client";

import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatters";
import { DollarSign, PieChart, TrendingUp, Wallet } from "lucide-react";

export function FundsClient({
  totalFund,
  investmentReturns,
  availableForLoans,
  reserveFund,
  allocation,
}: {
  totalFund: number;
  investmentReturns: number;
  availableForLoans: number;
  reserveFund: number;
  allocation: { label: string; amount: number; percent: number; color: string }[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Funds Management</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Overview of fund allocations and performance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Wallet} label="Total Fund Balance" value={formatCurrency(totalFund)} />
        <MetricCard icon={TrendingUp} label="Dividend Returns" value={formatCurrency(investmentReturns)} />
        <MetricCard icon={DollarSign} label="Available for Loans" value={formatCurrency(availableForLoans)} />
        <MetricCard icon={PieChart} label="Reserve Fund" value={formatCurrency(reserveFund)} />
      </div>

      <GlassCard className="p-6">
        <h3 className="mb-4 text-xl font-semibold text-brand-text">Fund Allocation</h3>
        <div className="space-y-4">
          {allocation.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg bg-brand-card-bg p-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="font-medium text-brand-text">{item.label}</span>
              </div>
              <span className="font-bold text-brand-text">
                {item.percent}% · {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
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
      <div className="mb-4 rounded-lg bg-brand-card-bg p-3 text-brand-accent w-fit">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mb-1 text-sm text-brand-text-secondary">{label}</p>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
    </GlassCard>
  );
}
