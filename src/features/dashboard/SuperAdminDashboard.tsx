'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  Users, 
  PiggyBank, 
  DollarSign, 
  Wallet, 
  CheckCircle, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield
} from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-brand-text-secondary">Monitor your entire financial ecosystem</p>
      </div>

      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Employees"
          value="1,247"
          change="+12.5%"
          trend="up"
          icon={Users}
          color="text-brand-accent"
        />
        <KPICard
          title="Total Savings"
          value="$2.4M"
          change="+8.2%"
          trend="up"
          icon={PiggyBank}
          color="text-brand-success"
        />
        <KPICard
          title="Total Loans"
          value="$1.8M"
          change="+15.3%"
          trend="up"
          icon={DollarSign}
          color="text-brand-warning"
        />
        <KPICard
          title="Fund Balance"
          value="$3.2M"
          change="+5.7%"
          trend="up"
          icon={Wallet}
          color="text-brand-accent"
        />
        <KPICard
          title="Pending Approvals"
          value="23"
          change="-8.1%"
          trend="down"
          icon={CheckCircle}
          color="text-brand-warning"
        />
        <KPICard
          title="Monthly Dividends"
          value="$45K"
          change="+22.4%"
          trend="up"
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
              <h3 className="text-lg font-semibold text-white">Savings Analytics</h3>
              <p className="text-brand-text-secondary text-sm">Monthly savings trends</p>
            </div>
            <select className="bg-brand-card-bg border border-brand-card-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-accent">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-brand-card-border rounded-lg">
            <p className="text-brand-text-secondary text-sm">Chart Component Placeholder</p>
          </div>
        </GlassCard>

        {/* Loan Analytics */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Loan Analytics</h3>
              <p className="text-brand-text-secondary text-sm">Distribution by type</p>
            </div>
          </div>
          <div className="space-y-4">
            <ChartBar label="Personal" value={45} color="bg-brand-accent" />
            <ChartBar label="Emergency" value={28} color="bg-brand-success" />
            <ChartBar label="Education" value={18} color="bg-brand-warning" />
            <ChartBar label="Business" value={9} color="bg-brand-danger" />
          </div>
        </GlassCard>
      </div>

      {/* Section 3: Fund Utilization */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Fund Utilization</h3>
            <p className="text-brand-text-secondary text-sm">Capital allocation overview</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-accent flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-white">56%</span>
            </div>
            <p className="text-white font-medium">Loans</p>
            <p className="text-brand-text-secondary text-sm">$1.8M</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-success flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-white">75%</span>
            </div>
            <p className="text-white font-medium">Savings</p>
            <p className="text-brand-text-secondary text-sm">$2.4M</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-warning flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-white">15%</span>
            </div>
            <p className="text-white font-medium">Reserves</p>
            <p className="text-brand-text-secondary text-sm">$480K</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-brand-card-border flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-white">4%</span>
            </div>
            <p className="text-white font-medium">Operations</p>
            <p className="text-brand-text-secondary text-sm">$128K</p>
          </div>
        </div>
      </GlassCard>

      {/* Section 4: Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-brand-text-secondary text-sm">Latest system events</p>
            </div>
            <Activity className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="space-y-4">
            <ActivityItem
              title="New user registered"
              description="John Smith joined as employee"
              time="2 minutes ago"
              icon={Users}
              color="text-brand-success"
            />
            <ActivityItem
              title="Loan approved"
              description="Loan #12345 approved by Fund Manager"
              time="15 minutes ago"
              icon={CheckCircle}
              color="text-brand-accent"
            />
            <ActivityItem
              title="Savings deposit"
              description="Sarah Johnson deposited $5,000"
              time="1 hour ago"
              icon={PiggyBank}
              color="text-brand-success"
            />
            <ActivityItem
              title="System update"
              description="Interest rates updated to 12%"
              time="3 hours ago"
              icon={Shield}
              color="text-brand-warning"
            />
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">System Health</h3>
              <p className="text-brand-text-secondary text-sm">Platform performance metrics</p>
            </div>
            <Shield className="w-5 h-5 text-brand-success" />
          </div>
          <div className="space-y-4">
            <HealthMetric label="Database Status" value="Operational" status="healthy" />
            <HealthMetric label="API Response Time" value="45ms" status="healthy" />
            <HealthMetric label="Uptime" value="99.9%" status="healthy" />
            <HealthMetric label="Storage Usage" value="67%" status="warning" />
            <HealthMetric label="Active Sessions" value="142" status="healthy" />
          </div>
        </GlassCard>
      </div>

      {/* Section 5: Approval Queue */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Approval Queue</h3>
            <p className="text-brand-text-secondary text-sm">Items awaiting your attention</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-warning/20 text-brand-warning rounded-full text-sm font-medium">
              23 pending
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
              <ApprovalRow type="Loan" requester="John Smith" amount="$15,000" status="Pending" time="2h ago" />
              <ApprovalRow type="Loan" requester="Sarah Johnson" amount="$8,500" status="Pending" time="3h ago" />
              <ApprovalRow type="Withdrawal" requester="Mike Davis" amount="$3,200" status="Pending" time="5h ago" />
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function KPICard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <GlassCard className="p-5 hover:bg-brand-hover transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-brand-card-bg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-brand-success' : 'text-brand-danger'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <p className="text-brand-text-secondary text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </GlassCard>
  );
}

function ChartBar({ label, value, color }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-brand-text-secondary text-sm">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-brand-card-bg rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ActivityItem({ title, description, time, icon: Icon, color }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-hover transition-all cursor-pointer">
      <div className={`p-2 rounded-lg bg-brand-card-bg ${color} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{title}</p>
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
    healthy: 'bg-brand-success',
    warning: 'bg-brand-warning',
    error: 'bg-brand-danger',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg">
      <span className="text-brand-text-secondary text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white font-medium">{value}</span>
        <div className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
      </div>
    </div>
  );
}

function ApprovalRow({ type, requester, amount, status, time }: any) {
  return (
    <tr className="border-b border-brand-card-border hover:bg-brand-hover transition-all">
      <td className="py-3 px-4 text-white text-sm">{type}</td>
      <td className="py-3 px-4 text-white text-sm">{requester}</td>
      <td className="py-3 px-4 text-white text-sm font-medium">{amount}</td>
      <td className="py-3 px-4">
        <span className="px-2 py-1 bg-brand-warning/20 text-brand-warning rounded-full text-xs font-medium">
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-brand-text-secondary text-sm">{time}</td>
      <td className="py-3 px-4">
        <button className="px-3 py-1.5 bg-brand-accent/20 text-brand-accent rounded-lg text-xs font-medium hover:bg-brand-accent/30 transition-all">
          Review
        </button>
      </td>
    </tr>
  );
}
