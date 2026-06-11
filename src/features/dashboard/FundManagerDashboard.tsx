'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import {
  Wallet,
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
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

// Sample data for charts
const fundPerformanceData = [
  { month: 'Jan', returns: 4.2 },
  { month: 'Feb', returns: 3.8 },
  { month: 'Mar', returns: 5.1 },
  { month: 'Apr', returns: 4.5 },
  { month: 'May', returns: 5.8 },
  { month: 'Jun', returns: 6.2 },
];

export default function FundManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Fund Management Dashboard</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Monitor and manage financial operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Fund Balance"
          value="₵3,245,678"
          change="+5.7%"
          trend="up"
          icon={Wallet}
          color="text-brand-accent"
        />
        <KPICard
          title="Expected Collections"
          value="₵456,789"
          change="+12.3%"
          trend="up"
          icon={DollarSign}
          color="text-brand-success"
        />
        <KPICard
          title="Disbursements"
          value="₵234,567"
          change="+8.1%"
          trend="up"
          icon={CreditCard}
          color="text-brand-warning"
        />
        <KPICard
          title="Loan Portfolio"
          value="₵1,823,456"
          change="+15.2%"
          trend="up"
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
          <RepaymentCard
            borrower=""
            amount="₵1,250"
            dueDate=""
            status="pending"
          />
          <RepaymentCard
            borrower=""
            amount="₵890"
            dueDate=""
            status="pending"
          />
          <RepaymentCard
            borrower=""
            amount="₵1,450"
            dueDate=""
            status="pending"
          />
          <RepaymentCard
            borrower=""
            amount="₵2,100"
            dueDate=""
            status="pending"
          />
          <RepaymentCard
            borrower=""
            amount="₵780"
            dueDate=""
            status="pending"
          />
          <RepaymentCard
            borrower=""
            amount="₵1,670"
            dueDate=""
            status="pending"
          />
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
            <ForecastMonth month="July" amount="₵125,000" percentage="85%" />
            <ForecastMonth month="August" amount="₵132,000" percentage="90%" />
            <ForecastMonth month="September" amount="₵145,000" percentage="95%" />
          </div>
          <div className="mt-6 p-4 bg-brand-card-bg rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-brand-text-secondary text-sm">Total Forecast</span>
              <span className="text-brand-text text-xl font-bold">₵402,000</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Loan Reviews Queue */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Loan Reviews</h3>
            <p className="text-brand-text-secondary text-sm">Applications awaiting your review</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-warning/20 text-brand-warning rounded-full text-sm font-medium">
              12 pending
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-card-border">
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Applicant</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Duration</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Purpose</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Risk Score</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <LoanReviewRow
                applicant=""
                amount="₵15,000"
                duration=""
                purpose=""
                riskScore=""
              />
              <LoanReviewRow
                applicant=""
                amount="₵8,500"
                duration=""
                purpose=""
                riskScore=""
              />
              <LoanReviewRow
                applicant=""
                amount="₵25,000"
                duration=""
                purpose=""
                riskScore=""
              />
              <LoanReviewRow
                applicant=""
                amount="₵12,000"
                duration=""
                purpose=""
                riskScore=""
              />
            </tbody>
          </table>
        </div>
      </GlassCard>

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
          <DisbursementRow
            recipient=""
            amount="₵15,000"
            loanId=""
            date=""
            status="completed"
          />
          <DisbursementRow
            recipient=""
            amount="₵8,500"
            loanId=""
            date=""
            status="completed"
          />
          <DisbursementRow
            recipient=""
            amount="₵25,000"
            loanId=""
            date=""
            status="completed"
          />
          <DisbursementRow
            recipient=""
            amount="₵12,000"
            loanId=""
            date=""
            status="pending"
          />
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
      <p className="text-brand-text text-2xl font-bold">{value}</p>
    </GlassCard>
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

function LoanReviewRow({ applicant, amount, duration, purpose, riskScore }: any) {
  const riskColors = {
    Low: 'bg-brand-success/20 text-brand-success',
    Medium: 'bg-brand-warning/20 text-brand-warning',
    High: 'bg-brand-danger/20 text-brand-danger',
  };

  return (
    <tr className="border-b border-brand-card-border hover:bg-brand-hover transition-all">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-sm">
            {applicant.charAt(0)}
          </div>
          <span className="text-brand-text text-sm">{applicant}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-brand-text font-medium text-sm">{amount}</td>
      <td className="py-3 px-4 text-brand-text-secondary text-sm">{duration}</td>
      <td className="py-3 px-4 text-brand-text text-sm">{purpose}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[riskScore as keyof typeof riskColors]}`}>
          {riskScore}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-brand-success/20 text-brand-success hover:bg-brand-success/30 transition-all">
            <CheckCircle className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-brand-danger/20 text-brand-danger hover:bg-brand-danger/30 transition-all">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
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
