'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import {
  Users,
  PiggyBank,
  BadgeCent,
  Wallet,
  CheckCircle,
  TrendingUp,
  Activity,
  Clock,
  Shield
} from 'lucide-react';
import type { DashboardStats } from '@/lib/dashboard/fetch-stats';
import { formatCompact, formatCurrency, formatNumber } from '@/utils/formatters';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function SuperAdminDashboard({ stats }: { stats: DashboardStats }) {
  const totalCapital = stats.totalSavings + stats.totalLoansOutstanding || 1;
  const loanPct = Math.round((stats.totalLoansOutstanding / totalCapital) * 100);
  const savingsPct = Math.round((stats.totalSavings / totalCapital) * 100);
  const reservePct = Math.max(0, 100 - loanPct - savingsPct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Platform Overview</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Monitor your entire financial ecosystem</p>
      </div>

      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 [&>*]:min-w-0">
        <DashboardStatCard
          title="Total Employees"
          value={formatNumber(stats.totalEmployees)}
          icon={Users}
          color="text-brand-accent"
        />
        <DashboardStatCard
          title="Total Savings"
          value={formatCurrency(stats.totalSavings)}
          icon={PiggyBank}
          color="text-brand-success"
        />
        <DashboardStatCard
          title="Total Loans"
          value={formatCurrency(stats.totalLoansOutstanding)}
          icon={BadgeCent}
          color="text-brand-warning"
        />
        <DashboardStatCard
          title="Fund Balance"
          value={formatCurrency(stats.fundBalance)}
          icon={Wallet}
          color="text-brand-accent"
        />
        <DashboardStatCard
          title="Pending Approvals"
          value={formatNumber(stats.pendingApprovals)}
          icon={CheckCircle}
          color="text-brand-warning"
        />
        <DashboardStatCard
          title="Monthly Dividends"
          value={formatCurrency(stats.totalDividends)}
          icon={TrendingUp}
          color="text-brand-success"
        />
      </div>

      {/* Section 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Analytics */}
        <GlassCard className="p-6 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Savings Analytics</h3>
              <p className="text-brand-text-secondary text-sm">Monthly savings trends</p>
            </div>
            <select className="bg-white border border-brand-card-border rounded-lg px-3 py-1.5 text-sm text-brand-text focus:outline-none focus:border-brand-green">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <div className="h-64">
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

        {/* Loan Analytics */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Loan Analytics</h3>
              <p className="text-brand-text-secondary text-sm">Distribution by type</p>
            </div>
          </div>
          {stats.loanDistribution.length === 0 ? (
            <p className="flex h-64 items-center justify-center text-sm text-brand-text-secondary">
              No loan data yet.
            </p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.loanDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.loanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {stats.loanDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-brand-text-secondary">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      {/* Section 3: Fund Utilization */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Fund Utilization</h3>
            <p className="text-brand-text-secondary text-sm">Capital allocation overview</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-accent flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{loanPct}%</span>
            </div>
            <p className="text-brand-text font-medium">Loans</p>
            <p className="text-brand-text-secondary text-sm">{formatCompact(stats.totalLoansOutstanding)}</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-green flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{savingsPct}%</span>
            </div>
            <p className="text-brand-text font-medium">Savings</p>
            <p className="text-brand-text-secondary text-sm">{formatCompact(stats.totalSavings)}</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-warning flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{reservePct}%</span>
            </div>
            <p className="text-brand-text font-medium">Reserves</p>
            <p className="text-brand-text-secondary text-sm">{formatCompact(stats.fundBalance)}</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-card-border flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-brand-text">{formatNumber(stats.activeUsers)}</span>
            </div>
            <p className="text-brand-text font-medium">Operations</p>
            <p className="text-brand-text-secondary text-sm">Active users</p>
          </div>
        </div>
      </GlassCard>

      {/* Section 4: Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">Recent Activity</h3>
              <p className="text-brand-text-secondary text-sm">Latest system events</p>
            </div>
            <Activity className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? stats.recentActivity.map((item) => (
              <ActivityItem
                key={item.id}
                title={item.title}
                description={item.description}
                time={item.time}
                icon={Activity}
                color="text-brand-accent"
              />
            )) : (
              <p className="text-brand-text-secondary text-sm">No recent activity</p>
            )}
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-text">System Health</h3>
              <p className="text-brand-text-secondary text-sm">Platform performance metrics</p>
            </div>
            <Shield className="w-5 h-5 text-brand-green" />
          </div>
          <div className="space-y-4">
            <HealthMetric label="Active Users" value={formatNumber(stats.activeUsers)} status="healthy" />
            <HealthMetric label="Pending Approvals" value={formatNumber(stats.pendingApprovals)} status={stats.pendingApprovals > 0 ? "warning" : "healthy"} />
            <HealthMetric label="Audit Events" value={formatNumber(stats.auditLogCount)} status="healthy" />
            <HealthMetric label="Transactions Today" value={formatNumber(stats.transactionsToday)} status="healthy" />
            <HealthMetric label="Total Employees" value={formatNumber(stats.totalEmployees)} status="healthy" />
          </div>
        </GlassCard>
      </div>

      {/* Section 5: Approval Queue */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Approval Queue</h3>
            <p className="text-brand-text-secondary text-sm">Items awaiting your attention</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-warning/20 text-brand-warning rounded-full text-sm font-medium">
              {stats.pendingApprovals} pending
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-card-border">
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Type</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Requester</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Time</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.approvalQueue.length > 0 ? stats.approvalQueue.map((item) => (
                <ApprovalRow
                  key={item.id}
                  type={item.type}
                  requester={item.requester}
                  amount={item.amount}
                  status={item.status}
                  time={item.time}
                />
              )) : (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-brand-text-secondary text-sm">
                    No pending approvals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function ActivityItem({ title, description, time, icon: Icon, color }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-hover transition-all cursor-pointer">
      <div className={`p-2 rounded-lg bg-brand-hover ${color} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-brand-text text-sm font-medium">{title}</p>
        <p className="text-brand-text-secondary text-xs">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-brand-text-secondary text-xs flex-shrink-0">
        <Clock className="w-3 h-3" />
        {time}
      </div>
    </div>
  );
}

function HealthMetric({ label, value, status }: any) {
  const statusColors = {
    healthy: 'bg-brand-green',
    warning: 'bg-brand-warning',
    error: 'bg-brand-danger',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-hover">
      <span className="text-brand-text-secondary text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-brand-text font-medium">{value}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
      </div>
    </div>
  );
}

function ApprovalRow({ type, requester, amount, status, time }: any) {
  return (
    <tr className="border-b border-brand-card-border hover:bg-brand-hover transition-all">
      <td className="py-3 px-4 text-brand-text text-sm">{type}</td>
      <td className="py-3 px-4 text-brand-text text-sm">{requester}</td>
      <td className="py-3 px-4 text-brand-text text-sm font-medium">{amount}</td>
      <td className="py-3 px-4">
        <span className="px-2 py-1 bg-brand-warning/20 text-brand-warning rounded-full text-xs font-medium">
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-brand-text-secondary text-sm">{time}</td>
      <td className="py-3 px-4">
        <button className="px-3 py-1.5 bg-brand-green/10 text-brand-green rounded-lg text-xs font-medium hover:bg-brand-green/20 transition-all">
          Review
        </button>
      </td>
    </tr>
  );
}
