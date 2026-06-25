'use client';

import React from 'react';
import ApprovalQueuePanel from '@/components/approvals/ApprovalQueuePanel';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import {
  Wallet,
  BadgeCent,
  CreditCard,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock
} from 'lucide-react';
import type { DashboardStats } from '@/lib/dashboard/fetch-stats';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function FundManagerDashboard({ stats }: { stats: DashboardStats }) {
  const fundPerformanceData = stats.loanTrend.map((item) => ({
    month: item.month,
    returns: item.repayments > 0
      ? Math.round((item.repayments / Math.max(item.disbursements, 1)) * 100)
      : 0,
  }));
  const forecastTotal = stats.upcomingRepayments.reduce(
    (acc, item) => acc + item.amountValue,
    0
  );

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
          title="Fund Balance"
          value={formatCurrency(stats.fundBalance)}
          icon={Wallet}
          color="text-brand-accent"
        />
        <DashboardStatCard
          title="Expected Collections"
          value={formatCurrency(
            stats.upcomingRepayments.reduce((acc, item) => acc + item.amountValue, 0)
          )}
          icon={BadgeCent}
          color="text-brand-success"
        />
        <DashboardStatCard
          title="Disbursements"
          value={formatCurrency(stats.totalLoansDisbursed)}
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

      {/* Repayment Calendar */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Repayment Calendar</h3>
            <p className="text-brand-text-secondary text-sm">Upcoming loan repayments</p>
          </div>
          <Calendar className="w-5 h-5 text-brand-accent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.upcomingRepayments.length > 0 ? stats.upcomingRepayments.map((repayment) => (
            <RepaymentCard
              key={repayment.id}
              borrower={repayment.borrower}
              amount={repayment.amount}
              dueDate={repayment.dueDate}
              status={repayment.status}
            />
          )) : (
            <p className="text-brand-text-secondary text-sm col-span-full">No upcoming repayments</p>
          )}
        </div>
      </GlassCard>

      {/* Fund Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-brand-text">Fund Performance</h3>
              <p className="text-brand-text-secondary text-sm">Monthly returns analysis</p>
            </div>
            <BarChart3 className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fundPerformanceData}>
                <defs>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b59a6d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b59a6d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="returns" stroke="#b59a6d" fillOpacity={1} fill="url(#colorReturns)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-brand-text">Collection Forecast</h3>
              <p className="text-brand-text-secondary text-sm">Projected collections for next quarter</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-success" />
          </div>
          <div className="space-y-4">
            {stats.upcomingRepayments.slice(0, 3).map((repayment) => (
              <ForecastMonth
                key={repayment.id}
                month={repayment.dueDate}
                amount={repayment.amount}
                percentage={forecastTotal > 0 ? `${Math.round((repayment.amountValue / forecastTotal) * 100)}%` : "0%"}
              />
            ))}
          </div>
          <div className="mt-6 p-4 bg-brand-card-bg rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-brand-text-secondary text-sm">Total Forecast</span>
              <span className="text-brand-text text-xl font-bold">{formatCurrency(forecastTotal)}</span>
            </div>
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

      {/* Recent Disbursements */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Recent Disbursements</h3>
            <p className="text-brand-text-secondary text-sm">Latest loan payouts</p>
          </div>
          <CreditCard className="w-5 h-5 text-brand-accent" />
        </div>
        <div className="space-y-3">
          {stats.recentDisbursements.length > 0 ? stats.recentDisbursements.map((item) => (
            <DisbursementRow
              key={item.id}
              recipient={item.recipient}
              amount={item.amount}
              loanId={item.loanId}
              date={item.date}
              status={item.status}
            />
          )) : (
            <p className="text-brand-text-secondary text-sm">No recent disbursements</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function RepaymentCard({ borrower, amount, dueDate, status }: any) {
  const statusColors = {
    pending: 'text-brand-warning',
    overdue: 'text-brand-danger',
    completed: 'text-brand-success',
  };

  return (
    <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border hover:bg-brand-hover transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
            {borrower.charAt(0)}
          </div>
          <div>
            <p className="text-brand-text font-medium">{borrower}</p>
            <p className="text-brand-text-secondary text-xs">{dueDate}</p>
          </div>
        </div>
        <Clock className={`w-4 h-4 ${statusColors[status as keyof typeof statusColors]}`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-brand-text text-lg font-bold">{amount}</span>
        <span className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
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

function DisbursementRow({ recipient, amount, loanId, date, status }: any) {
  const statusColors = {
    completed: 'text-brand-success',
    pending: 'text-brand-warning',
    failed: 'text-brand-danger',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg hover:bg-brand-hover transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
          {recipient.charAt(0)}
        </div>
        <div>
          <p className="text-brand-text font-medium">{recipient}</p>
          <p className="text-brand-text-secondary text-xs">{loanId} • {date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-brand-text font-bold">{amount}</span>
        <span className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
}
