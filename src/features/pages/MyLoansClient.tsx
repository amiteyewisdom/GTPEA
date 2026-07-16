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
        searchText: `${loan.loan_ref} ${loan.loan_products?.name ?? ""} ${loan.purpose ?? ""} ${loan.status}`,
        content: (
          <div className="rounded-lg bg-brand-card-bg p-4">
            <div className="flex items-start gap-4">
              <BadgeCent className="mt-0.5 h-5 w-5 text-brand-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{loan.loan_ref}</p>
                    <p className="text-xs font-medium text-brand-accent">{loan.loan_products?.name ?? "Loan"}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold capitalize text-brand-text-secondary">
                    {loan.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <LoanDetail label="Facility Amount" value={formatCurrency(loan.amount_disbursed || loan.amount_approved || loan.amount_requested)} />
                  <LoanDetail label="Monthly Payment" value={formatCurrency(loan.monthly_repayment || 0)} highlight />
                  <LoanDetail label="Outstanding Balance" value={loan.status === "pending" ? "—" : formatCurrency(loan.outstanding_balance || 0)} />
                  <LoanDetail label="Date Approved" value={loan.approved_at ? formatDate(loan.approved_at) : "—"} />
                </div>
              </div>
            </div>
          </div>
        ),
      }))}
    />
  );
}

function LoanDetail({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-lg bg-brand-green/10 p-2" : "p-2"}>
      <p className="text-xs text-brand-text-secondary">{label}</p>
      <p className={`mt-1 text-sm font-bold ${highlight ? "text-brand-green" : "text-brand-text"}`}>{value}</p>
    </div>
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
