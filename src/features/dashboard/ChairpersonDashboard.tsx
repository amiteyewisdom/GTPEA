'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  PiggyBank, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar,
  TrendingDown
} from 'lucide-react';

export default function ChairpersonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Executive Dashboard</h1>
        <p className="text-brand-text-secondary">High-level financial oversight and strategic insights</p>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExecutiveKPICard
          title="Total Savings"
          value="$2,456,789"
          change="+8.2%"
          trend="up"
          icon={PiggyBank}
          color="text-brand-success"
        />
        <ExecutiveKPICard
          title="Total Loans"
          value="$1,823,456"
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          color="text-brand-warning"
        />
        <ExecutiveKPICard
          title="Dividends Distributed"
          value="$456,789"
          change="+15.3%"
          trend="up"
          icon={TrendingUp}
          color="text-brand-accent"
        />
        <ExecutiveKPICard
          title="Withdrawals"
          value="$234,567"
          change="-5.2%"
          trend="down"
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
              <h3 className="text-xl font-semibold text-white">Savings Trend</h3>
              <p className="text-brand-text-secondary text-sm">12-month overview</p>
            </div>
            <select className="bg-brand-card-bg border border-brand-card-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-accent">
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>YTD</option>
            </select>
          </div>
          <div className="h-80 flex items-center justify-center border border-dashed border-brand-card-border rounded-lg">
            <p className="text-brand-text-secondary text-sm">Large Savings Chart Placeholder</p>
          </div>
        </GlassCard>

        {/* Loan Trend */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Loan Trend</h3>
              <p className="text-brand-text-secondary text-sm">Disbursement and repayment analysis</p>
            </div>
            <select className="bg-brand-card-bg border border-brand-card-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-accent">
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>YTD</option>
            </select>
          </div>
          <div className="h-80 flex items-center justify-center border border-dashed border-brand-card-border rounded-lg">
            <p className="text-brand-text-secondary text-sm">Large Loan Chart Placeholder</p>
          </div>
        </GlassCard>
      </div>

      {/* Fund Health */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Fund Health</h3>
            <p className="text-brand-text-secondary text-sm">Overall financial position</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-brand-card-bg rounded-lg">
            <div className="w-32 h-32 mx-auto rounded-full border-8 border-brand-success flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">75%</span>
            </div>
            <p className="text-white font-semibold text-lg">Solvency Ratio</p>
            <p className="text-brand-success text-sm mt-1">Excellent</p>
          </div>
          <div className="text-center p-6 bg-brand-card-bg rounded-lg">
            <div className="w-32 h-32 mx-auto rounded-full border-8 border-brand-accent flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">68%</span>
            </div>
            <p className="text-white font-semibold text-lg">Loan-to-Savings</p>
            <p className="text-brand-accent text-sm mt-1">Healthy</p>
          </div>
          <div className="text-center p-6 bg-brand-card-bg rounded-lg">
            <div className="w-32 h-32 mx-auto rounded-full border-8 border-brand-warning flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">82%</span>
            </div>
            <p className="text-white font-semibold text-lg">Recovery Rate</p>
            <p className="text-brand-warning text-sm mt-1">Good</p>
          </div>
        </div>
      </GlassCard>

      {/* Employee Summary Table */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Employee Summary</h3>
            <p className="text-brand-text-secondary text-sm">Member financial overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 bg-brand-card-bg border border-brand-card-border rounded-lg text-white placeholder-brand-text-secondary focus:outline-none focus:border-brand-accent text-sm"
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
              <EmployeeRow 
                name="John Smith" 
                savings="$45,000" 
                loans="$15,000" 
                balance="$8,500" 
                dividends="$2,250" 
                withdrawals="$5,000" 
              />
              <EmployeeRow 
                name="Sarah Johnson" 
                savings="$32,000" 
                loans="$8,000" 
                balance="$4,200" 
                dividends="$1,600" 
                withdrawals="$2,000" 
              />
              <EmployeeRow 
                name="Mike Davis" 
                savings="$28,000" 
                loans="$12,000" 
                balance="$6,800" 
                dividends="$1,400" 
                withdrawals="$3,500" 
              />
              <EmployeeRow 
                name="Emily Brown" 
                savings="$55,000" 
                loans="$20,000" 
                balance="$11,200" 
                dividends="$2,750" 
                withdrawals="$8,000" 
              />
              <EmployeeRow 
                name="David Wilson" 
                savings="$38,000" 
                loans="$10,000" 
                balance="$5,500" 
                dividends="$1,900" 
                withdrawals="$4,500" 
              />
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Upcoming Meetings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Upcoming Meetings</h3>
            <p className="text-brand-text-secondary text-sm">Scheduled board and committee meetings</p>
          </div>
          <Calendar className="w-5 h-5 text-brand-accent" />
        </div>
        <div className="space-y-4">
          <MeetingCard
            title="Board Meeting"
            date="June 15, 2026"
            time="10:00 AM"
            location="Conference Room A"
            agenda="Quarterly financial review, loan approvals, dividend distribution"
          />
          <MeetingCard
            title="Finance Committee"
            date="June 22, 2026"
            time="2:00 PM"
            location="Board Room"
            agenda="Budget review, fund allocation, investment strategy"
          />
          <MeetingCard
            title="Annual General Meeting"
            date="July 10, 2026"
            time="9:00 AM"
            location="Main Hall"
            agenda="Annual report presentation, member elections, strategic planning"
          />
        </div>
      </GlassCard>
    </div>
  );
}

function ExecutiveKPICard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <GlassCard className="p-6 hover:bg-brand-hover transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-brand-card-bg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-brand-success' : 'text-brand-danger'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          {change}
        </div>
      </div>
      <p className="text-brand-text-secondary text-sm mb-2">{title}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
    </GlassCard>
  );
}

function EmployeeRow({ name, savings, loans, balance, dividends, withdrawals }: any) {
  return (
    <tr className="border-b border-brand-card-border hover:bg-brand-hover transition-all">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
            {name.charAt(0)}
          </div>
          <span className="text-white font-medium">{name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-white font-medium">{savings}</td>
      <td className="py-4 px-4 text-white font-medium">{loans}</td>
      <td className="py-4 px-4 text-brand-warning font-medium">{balance}</td>
      <td className="py-4 px-4 text-brand-success font-medium">{dividends}</td>
      <td className="py-4 px-4 text-white font-medium">{withdrawals}</td>
    </tr>
  );
}

function MeetingCard({ title, date, time, location, agenda }: any) {
  return (
    <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border hover:bg-brand-hover transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-semibold text-lg">{title}</h4>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-brand-accent text-sm font-medium">{date}</span>
            <span className="text-brand-text-secondary text-sm">{time}</span>
          </div>
        </div>
        <Calendar className="w-5 h-5 text-brand-accent flex-shrink-0" />
      </div>
      <p className="text-brand-text-secondary text-sm mb-2">
        <span className="text-white font-medium">Location:</span> {location}
      </p>
      <p className="text-brand-text-secondary text-sm">
        <span className="text-white font-medium">Agenda:</span> {agenda}
      </p>
    </div>
  );
}
