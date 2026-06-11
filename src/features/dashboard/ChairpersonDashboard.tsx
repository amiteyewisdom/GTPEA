'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import {
  PiggyBank,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  TrendingDown
} from 'lucide-react';
import type { DashboardStats } from '@/lib/dashboard/fetch-stats';
import { formatCurrency } from '@/utils/formatters';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function ChairpersonDashboard({ stats }: { stats: DashboardStats }) {
  const solvencyRatio = stats.totalSavings
    ? Math.round((stats.fundBalance / stats.totalSavings) * 100)
    : 0;
  const loanToSavings = stats.totalSavings
    ? Math.round((stats.totalLoansOutstanding / stats.totalSavings) * 100)
    : 0;
  const recoveryRate = stats.totalLoansDisbursed
    ? Math.round(((stats.totalLoansDisbursed - stats.totalLoansOutstanding) / stats.totalLoansDisbursed) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Executive Dashboard</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">High-level financial oversight and strategic insights</p>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard
          large
          title="Total Savings"
          value={formatCurrency(stats.totalSavings)}
          icon={PiggyBank}
          color="text-brand-success"
        />
        <DashboardStatCard
          large
          title="Total Loans"
          value={formatCurrency(stats.totalLoansOutstanding)}
          icon={DollarSign}
          color="text-brand-warning"
        />
        <DashboardStatCard
          large
          title="Dividends Distributed"
          value={formatCurrency(stats.totalDividends)}
          icon={TrendingUp}
          color="text-brand-accent"
        />
        <DashboardStatCard
          large
          title="Withdrawals"
          value={formatCurrency(stats.totalWithdrawals)}
          icon={TrendingDown}
          color="text-brand-danger"
        />
      </div>

      {/* Large Executive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Trend */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-brand-text">Savings Trend</h3>
              <p className="text-brand-text-secondary text-sm">12-month overview</p>
            </div>
            <select className="bg-brand-card-bg border border-brand-card-border rounded-lg px-3 py-1.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent">
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>YTD</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.savingsTrend}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="savings" stroke="#2D7A4D" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Loan Trend */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-brand-text">Loan Trend</h3>
              <p className="text-brand-text-secondary text-sm">Disbursement and repayment analysis</p>
            </div>
            <select className="bg-brand-card-bg border border-brand-card-border rounded-lg px-3 py-1.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent">
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>YTD</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.loanTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `₵${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value) => `₵${(value as number).toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                />
                <Bar dataKey="disbursements" fill="#b59a6d" name="Disbursements" />
                <Bar dataKey="repayments" fill="#2D7A4D" name="Repayments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Fund Health */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Fund Health</h3>
            <p className="text-brand-text-secondary text-sm">Overall financial position</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-brand-card-bg rounded-lg">
            <div className="w-32 h-32 mx-auto rounded-full border-8 border-brand-success flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-brand-text">{solvencyRatio}%</span>
            </div>
            <p className="text-brand-text font-semibold text-lg">Solvency Ratio</p>
            <p className="text-brand-success text-sm mt-1">Excellent</p>
          </div>
          <div className="text-center p-6 bg-brand-card-bg rounded-lg">
            <div className="w-32 h-32 mx-auto rounded-full border-8 border-brand-accent flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-brand-text">{loanToSavings}%</span>
            </div>
            <p className="text-brand-text font-semibold text-lg">Loan-to-Savings</p>
            <p className="text-brand-accent text-sm mt-1">Healthy</p>
          </div>
          <div className="text-center p-6 bg-brand-card-bg rounded-lg">
            <div className="w-32 h-32 mx-auto rounded-full border-8 border-brand-warning flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-brand-text">{recoveryRate}%</span>
            </div>
            <p className="text-brand-text font-semibold text-lg">Recovery Rate</p>
            <p className="text-brand-warning text-sm mt-1">Good</p>
          </div>
        </div>
      </GlassCard>

      {/* Employee Summary Table */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Employee Summary</h3>
            <p className="text-brand-text-secondary text-sm">Member financial overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 bg-brand-card-bg border border-brand-card-border rounded-lg text-brand-text placeholder-brand-text-secondary focus:outline-none focus:border-brand-accent text-sm"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-card-border">
                <th className="text-left py-4 px-4 text-brand-text-secondary text-sm font-medium">Employee</th>
                <th className="text-left py-4 px-4 text-brand-text-secondary text-sm font-medium">Savings</th>
                <th className="text-left py-4 px-4 text-brand-text-secondary text-sm font-medium">Loans</th>
                <th className="text-left py-4 px-4 text-brand-text-secondary text-sm font-medium">Outstanding Balance</th>
                <th className="text-left py-4 px-4 text-brand-text-secondary text-sm font-medium">Dividends</th>
                <th className="text-left py-4 px-4 text-brand-text-secondary text-sm font-medium">Withdrawals</th>
              </tr>
            </thead>
            <tbody>
              {stats.employeeSummaries.length > 0 ? stats.employeeSummaries.map((employee) => (
                <EmployeeRow
                  key={employee.id}
                  name={employee.name}
                  savings={employee.savings}
                  loans={employee.loans}
                  balance={employee.balance}
                  dividends={employee.dividends}
                  withdrawals={employee.withdrawals}
                />
              )) : (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-brand-text-secondary text-sm">
                    No employee data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Upcoming Meetings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Upcoming Meetings</h3>
            <p className="text-brand-text-secondary text-sm">Scheduled board and committee meetings</p>
          </div>
          <Calendar className="w-5 h-5 text-brand-accent" />
        </div>
        <p className="py-8 text-center text-sm text-brand-text-secondary">
          No meetings scheduled. Meetings will appear here once added to the system.
        </p>
      </GlassCard>
    </div>
  );
}

function EmployeeRow({ name, savings, loans, balance, dividends, withdrawals }: any) {
  const initial = name?.charAt(0) || "?";
  return (
    <tr className="border-b border-brand-card-border hover:bg-brand-hover transition-all">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
            {initial}
          </div>
          <span className="text-brand-text font-medium">{name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-brand-text font-medium">{savings}</td>
      <td className="py-4 px-4 text-brand-text font-medium">{loans}</td>
      <td className="py-4 px-4 text-brand-warning font-medium">{balance}</td>
      <td className="py-4 px-4 text-brand-success font-medium">{dividends}</td>
      <td className="py-4 px-4 text-brand-text font-medium">{withdrawals}</td>
    </tr>
  );
}

function MeetingCard({ title, date, time, location, agenda }: any) {
  return (
    <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border hover:bg-brand-hover transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-brand-text font-semibold text-lg">{title}</h4>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-brand-accent text-sm font-medium">{date}</span>
            <span className="text-brand-text-secondary text-sm">{time}</span>
          </div>
        </div>
        <Calendar className="w-5 h-5 text-brand-accent flex-shrink-0" />
      </div>
      <p className="text-brand-text-secondary text-sm mb-2">
        <span className="text-brand-text font-medium">Location:</span> {location}
      </p>
      <p className="text-brand-text-secondary text-sm">
        <span className="text-brand-text font-medium">Agenda:</span> {agenda}
      </p>
    </div>
  );
}
