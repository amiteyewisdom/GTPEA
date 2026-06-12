"use client";

import GlassCard from "@/components/ui/GlassCard";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { CheckCircle, Clock, BadgeCent } from "lucide-react";

export function MyLoansClient({
  pending,
  active,
  totalBorrowed,
  loans,
}: {
  pending: number;
  active: number;
  totalBorrowed: number;
  loans: any[];
}) {
  return (
    <SearchableList
      title="My Loans"
      subtitle="View your loan applications and status"
      searchPlaceholder="Search loans..."
      emptyMessage="No loan applications found."
      stats={
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard icon={Clock} label="Pending" value={String(pending)} color="text-brand-warning" />
          <StatCard icon={CheckCircle} label="Active" value={String(active)} color="text-brand-success" />
          <StatCard icon={BadgeCent} label="Total Borrowed" value={formatCurrency(totalBorrowed)} color="text-brand-accent" />
        </div>
      }
      items={loans.map((loan) => ({
        id: loan.id,
        searchText: `${loan.loan_ref} ${loan.purpose ?? ""} ${loan.status}`,
        content: (
          <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
            <BadgeCent className="h-5 w-5 text-brand-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-brand-text">{loan.loan_ref}</p>
              <p className="text-xs text-brand-text-secondary">
                {loan.loan_products?.name ?? "Loan"} · {formatCurrency(loan.amount_disbursed || loan.amount_requested)} · {loan.status}
              </p>
            </div>
            <p className="text-xs text-brand-text-secondary">{formatDate(loan.created_at)}</p>
          </div>
        ),
      }))}
    />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <GlassCard className="p-6">
      <div className="mb-2 flex items-center gap-3">
        <div className={`rounded-lg bg-brand-card-bg p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-brand-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
    </GlassCard>
  );
}
