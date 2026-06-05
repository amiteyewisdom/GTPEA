'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  DollarSign, 
  PiggyBank, 
  Briefcase, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-brand-lg bg-gradient-to-r from-brand-sidebar to-brand-primary border border-brand-card-border p-8 lg:p-12">
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
            Welcome Back, John
          </h1>
          <p className="text-brand-text-secondary text-lg mb-6">
            Manage your savings, loans, and financial goals
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
              <DollarSign className="w-5 h-5" />
              Apply for Loan
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-card-bg border border-brand-card-border text-white font-semibold rounded-lg hover:bg-brand-hover transition-all">
              <PiggyBank className="w-5 h-5" />
              View Savings
            </button>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-brand-success/10 rounded-full blur-3xl" />
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard
          title="Savings Balance"
          value="$45,000.00"
          change="+$2,500"
          trend="up"
          icon={PiggyBank}
          color="text-brand-success"
        />
        <BalanceCard
          title="Loan Balance"
          value="$15,000.00"
          change="-$1,250"
          trend="down"
          icon={Briefcase}
          color="text-brand-warning"
        />
        <BalanceCard
          title="Pending Requests"
          value="2"
          change="1 loan, 1 withdrawal"
          trend="neutral"
          icon={Clock}
          color="text-brand-accent"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Apply Loan"
          description="Submit a new loan application"
          icon={DollarSign}
          color="bg-brand-accent/20 text-brand-accent"
        />
        <QuickActionCard
          title="View Savings"
          description="Check your savings history"
          icon={PiggyBank}
          color="bg-brand-success/20 text-brand-success"
        />
        <QuickActionCard
          title="My Loans"
          description="View active and past loans"
          icon={Briefcase}
          color="bg-brand-warning/20 text-brand-warning"
        />
        <QuickActionCard
          title="Withdrawals"
          description="Request savings withdrawal"
          icon={TrendingUp}
          color="bg-brand-accent/20 text-brand-accent"
        />
      </div>

      {/* Active Loans */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Active Loans</h3>
            <p className="text-brand-text-secondary text-sm">Your current loan portfolio</p>
          </div>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:text-brand-accent/80 transition-all">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <LoanCard
            loanId="LN-2026-001"
            amount="$15,000"
            remainingBalance="$8,500"
            monthlyPayment="$1,250"
            nextDueDate="June 15, 2026"
            status="active"
          />
          <LoanCard
            loanId="LN-2025-008"
            amount="$8,000"
            remainingBalance="$2,100"
            monthlyPayment="$890"
            nextDueDate="June 10, 2026"
            status="active"
          />
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
            <p className="text-brand-text-secondary text-sm">Your latest transactions</p>
          </div>
        </div>
        <div className="space-y-3">
          <ActivityRow
            type="deposit"
            description="Savings deposit"
            amount="$2,500.00"
            date="June 5, 2026"
            status="completed"
          />
          <ActivityRow
            type="payment"
            description="Loan repayment"
            amount="$1,250.00"
            date="June 1, 2026"
            status="completed"
          />
          <ActivityRow
            type="withdrawal"
            description="Savings withdrawal request"
            amount="$3,000.00"
            date="May 28, 2026"
            status="pending"
          />
          <ActivityRow
            type="dividend"
            description="Dividend credit"
            amount="$450.00"
            date="May 25, 2026"
            status="completed"
          />
        </div>
      </GlassCard>

      {/* Loan Application Status */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Loan Application Status</h3>
            <p className="text-brand-text-secondary text-sm">Track your pending applications</p>
          </div>
        </div>
        <div className="space-y-4">
          <ApplicationStatusCard
            applicationId="LA-2026-015"
            amount="$12,000"
            purpose="Home Improvement"
            submittedDate="June 3, 2026"
            currentStage="union_review"
            stages={['submitted', 'union_review', 'fund_manager', 'chairperson', 'approved']}
          />
        </div>
      </GlassCard>
    </div>
  );
}

function BalanceCard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <GlassCard className="p-6 hover:bg-brand-hover transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-brand-card-bg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-brand-success' : 'text-brand-danger'}`}>
            {change}
          </div>
        )}
      </div>
      <p className="text-brand-text-secondary text-sm mb-2">{title}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
    </GlassCard>
  );
}

function QuickActionCard({ title, description, icon: Icon, color }: any) {
  return (
    <GlassCard className="p-5 hover:bg-brand-hover transition-all cursor-pointer group">
      <div className={`p-3 rounded-lg ${color} mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-white font-semibold mb-1">{title}</h4>
      <p className="text-brand-text-secondary text-sm">{description}</p>
    </GlassCard>
  );
}

function LoanCard({ loanId, amount, remainingBalance, monthlyPayment, nextDueDate, status }: any) {
  const statusColors = {
    active: 'text-brand-success',
    overdue: 'text-brand-danger',
    pending: 'text-brand-warning',
  };

  return (
    <div className="p-4 rounded-lg bg-brand-card-bg border border-brand-card-border hover:bg-brand-hover transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-accent/20 text-brand-accent">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-medium">{loanId}</p>
            <p className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
        </div>
        <span className="text-white font-bold text-lg">{amount}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-brand-text-secondary text-xs mb-1">Remaining</p>
          <p className="text-white font-medium">{remainingBalance}</p>
        </div>
        <div>
          <p className="text-brand-text-secondary text-xs mb-1">Monthly</p>
          <p className="text-white font-medium">{monthlyPayment}</p>
        </div>
        <div>
          <p className="text-brand-text-secondary text-xs mb-1">Next Due</p>
          <p className="text-white font-medium">{nextDueDate}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ type, description, amount, date, status }: any) {
  const typeIcons = {
    deposit: PiggyBank,
    payment: DollarSign,
    withdrawal: TrendingUp,
    dividend: CheckCircle,
  };

  const statusIcons = {
    completed: CheckCircle,
    pending: Clock,
    failed: AlertCircle,
  };

  const statusColors = {
    completed: 'text-brand-success',
    pending: 'text-brand-warning',
    failed: 'text-brand-danger',
  };

  const TypeIcon = typeIcons[type as keyof typeof typeIcons];
  const StatusIcon = statusIcons[status as keyof typeof statusIcons];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg hover:bg-brand-hover transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${type === 'deposit' || type === 'dividend' ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-accent/20 text-brand-accent'}`}>
          <TypeIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-medium">{description}</p>
          <p className="text-brand-text-secondary text-xs">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-white font-bold ${type === 'withdrawal' ? 'text-brand-danger' : ''}`}>
          {type === 'withdrawal' ? '-' : '+'}{amount}
        </span>
        <StatusIcon className={`w-5 h-5 ${statusColors[status as keyof typeof statusColors]}`} />
      </div>
    </div>
  );
}

function ApplicationStatusCard({ applicationId, amount, purpose, submittedDate, currentStage, stages }: any) {
  const stageLabels = {
    submitted: 'Submitted',
    union_review: 'Union Review',
    fund_manager: 'Fund Manager',
    chairperson: 'Chairperson',
    approved: 'Approved',
  };

  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="p-5 rounded-lg bg-brand-card-bg border border-brand-card-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-semibold">{applicationId}</p>
          <p className="text-brand-text-secondary text-sm">{purpose} • {amount}</p>
        </div>
        <span className="text-brand-text-secondary text-xs">{submittedDate}</span>
      </div>

      {/* Progress Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          {stages.map((stage: string, index: number) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted ? 'bg-brand-success text-brand-primary' : ''}
                    ${isCurrent ? 'bg-brand-accent text-brand-primary' : ''}
                    ${isPending ? 'bg-brand-card-bg border border-brand-card-border text-brand-text-secondary' : ''}
                  `}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <p className={`text-xs mt-2 ${isCurrent ? 'text-brand-accent font-medium' : 'text-brand-text-secondary'}`}>
                  {stageLabels[stage as keyof typeof stageLabels]}
                </p>
              </div>
            );
          })}
        </div>
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-brand-card-border -z-10">
          <div 
            className="h-full bg-brand-accent transition-all duration-500"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
