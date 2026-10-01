'use client';

import React from 'react';
import ApprovalQueuePanel from '@/components/approvals/ApprovalQueuePanel';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import {
  Wallet,
  BadgeCent,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import type { DashboardStats } from '@/lib/dashboard/fetch-stats';
import { formatCurrency } from '@/utils/formatters';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function FundManagerDashboard({ stats }: { stats: DashboardStats }) {
  const forecastTotal = stats.collectionForecast.reduce((acc, item) => acc + item.amountValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Fund Management Dashboard</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Monitor and manage financial operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Savings less Loans"
          value={formatCurrency(stats.fundBalance)}
          icon={Wallet}
          color="text-brand-accent"
        />
        <DashboardStatCard
          title="Expected Payroll Deductions"
          value={formatCurrency(stats.expectedCollections)}
          icon={BadgeCent}
          color="text-brand-success"
        />
        <DashboardStatCard
          title="Active Loans"
          value={stats.activeLoanCount.toLocaleString()}
          icon={CreditCard}
          color="text-brand-warning"
        />
        <DashboardStatCard
          title="Total Loan Balance"
          value={formatCurrency(stats.totalLoansOutstanding)}
          icon={TrendingUp}
          color="text-brand-accent"
        />
      </div>

      {/* Payroll Recovery & Projected Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-brand-text">Last Payroll Recovery</h3>
              <p className="text-brand-text-secondary text-sm">Loan deductions recorded from the most recent payroll file</p>
            </div>
            <BadgeCent className="w-5 h-5 text-brand-accent" />
          </div>
          {stats.lastPayrollRecovery ? (
            <div>
              <p className="text-sm text-brand-text-secondary">{stats.lastPayrollRecovery.period}</p>
              <p className="text-brand-text text-2xl font-bold mt-1">{stats.lastPayrollRecovery.totalFormatted}</p>
              <p className="text-sm text-brand-text-secondary mt-2">across {stats.lastPayrollRecovery.loanCount} loans</p>
            </div>
          ) : (
            <p className="text-sm text-brand-text-secondary">No payroll file has been processed yet.</p>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-brand-text">Projected Collections</h3>
              <p className="text-brand-text-secondary text-sm">Based on monthly payroll deductions, next 3 months</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-success" />
          </div>
          <div className="space-y-4">
            {stats.collectionForecast.length > 0 ? stats.collectionForecast.map((item) => (
              <ForecastMonth
                key={item.month}
                month={item.month}
                amount={item.amount}
                percentage={item.percentage}
              />
            )) : (
              <p className="text-sm text-brand-text-secondary">No collection forecast data.</p>
            )}
          </div>
          <div className="mt-6 p-4 bg-brand-card-bg rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-brand-text-secondary text-sm">3-month total</span>
              <span className="text-brand-text text-xl font-bold">{formatCurrency(forecastTotal)}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Trend */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-brand-text">Savings Trend</h3>
              <p className="text-brand-text-secondary text-sm">12-month overview</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.savingsTrend}>
                <defs>
                  <linearGradient id="colorSavingsFm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D7A4D" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2D7A4D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `₵${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value) => `₵${(value as number).toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="savings" stroke="#2D7A4D" fillOpacity={1} fill="url(#colorSavingsFm)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <ApprovalQueuePanel
        title="Loan Reviews — Your Turn"
        description="Stage 2 applications ready for Fund Manager review. Approving sends them to the Chairperson."
        items={stats.pendingLoanReviews.map((loan) => ({
          approvalId: loan.approvalId,
          loanId: loan.id,
          applicant: loan.applicant,
          amount: loan.amount,
          amountValue: 0,
          duration: loan.duration,
          purpose: loan.purpose,
          currentStage: loan.currentStage,
          totalStages: loan.totalStages,
          riskScore: loan.riskScore,
        }))}
        emptyText="No applications waiting for Fund Manager approval."
      />

    </div>
  );
}

function ForecastMonth({ month, amount, percentage }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-brand-text font-medium">{month}</span>
        <span className="text-brand-accent font-bold">{amount}</span>
      </div>
      <div className="h-2 bg-brand-card-bg rounded-full overflow-hidden">
        <div className="h-full bg-brand-accent rounded-full transition-all duration-500" style={{ width: percentage }} />
      </div>
    </div>
  );
}

