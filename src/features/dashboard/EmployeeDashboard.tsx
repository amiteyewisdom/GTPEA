'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import {
  BadgeCent,
  PiggyBank,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { APPROVAL_STAGES, employeeStageLabel } from '@/lib/loans/workflow';

interface DashboardData {
  fullName: string;
  totalSavings: number;
  totalLoanBalance: number;
  pendingRequests: number;
  activeLoans: any[];
  recentActivity: any[];
  pendingApplications: any[];
  savingsChange?: string;
  loanChange?: string;
}

export default function EmployeeDashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-brand-lg bg-gradient-to-r from-brand-sidebar to-brand-primary border border-brand-card-border p-6 lg:p-12">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-text mb-3">
            Welcome Back, {data.fullName || 'User'}
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-brand-text-secondary mb-6">
            Manage your savings, loans, and financial goals
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => router.push('/apply-loan')} className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all">
              <span className="text-base font-bold leading-none">GH₵</span>
              Apply for Loan
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-card-bg border border-brand-card-border text-brand-text font-semibold rounded-lg hover:bg-brand-hover transition-all">
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
        <DashboardStatCard
          large
          title="Savings Balance"
          value={formatCurrency(data.totalSavings)}
          change={data.savingsChange}
          trend="up"
          icon={PiggyBank}
          color="text-brand-success"
        />
        <DashboardStatCard
          large
          title="Loan Balance"
          value={formatCurrency(data.totalLoanBalance)}
          change={data.loanChange}
          trend="down"
          icon={Briefcase}
          color="text-brand-warning"
        />
        <DashboardStatCard
          large
          title="Pending Requests"
          value={data.pendingRequests.toString()}
          change={`${data.pendingApplications.length} pending`}
          icon={Clock}
          color="text-brand-accent"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Apply Loan"
          description="Submit a new loan application"
          icon={BadgeCent}
          color="bg-brand-accent/20 text-brand-accent"
          href="/apply-loan"
        />
        <QuickActionCard
          title="View Savings"
          description="Check your savings history"
          icon={PiggyBank}
          color="bg-brand-success/20 text-brand-success"
          href="/savings-history"
        />
        <QuickActionCard
          title="My Loans"
          description="View active and past loans"
          icon={Briefcase}
          color="bg-brand-warning/20 text-brand-warning"
          href="/my-loans"
        />
        <QuickActionCard
          title="Withdrawals"
          description="Request savings withdrawal"
          icon={TrendingUp}
          color="bg-brand-accent/20 text-brand-accent"
          href="/withdrawal-history"
        />
      </div>

      {/* Active Loans */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Active Loans</h3>
            <p className="text-brand-text-secondary text-sm">Your current loan portfolio</p>
          </div>
          <button className="flex items-center gap-2 text-brand-accent text-sm font-medium hover:text-brand-accent/80 transition-all">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {data.activeLoans.length > 0 ? data.activeLoans.map((loan: any) => (
            <LoanCard
              key={loan.id}
              loanId={loan.loan_ref || 'N/A'}
              amount={formatCurrency(loan.amount_approved || 0)}
              remainingBalance={formatCurrency(loan.outstanding_balance || 0)}
              monthlyPayment={formatCurrency(loan.monthly_payment || 0)}
              nextDueDate={loan.next_payment_date ? formatDate(loan.next_payment_date) : 'N/A'}
              status={loan.status || 'active'}
            />
          )) : (
            <p className="text-brand-text-secondary text-sm">No active loans</p>
          )}
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Recent Activity</h3>
            <p className="text-brand-text-secondary text-sm">Your latest transactions</p>
          </div>
        </div>
        <div className="space-y-3">
          {data.recentActivity.length > 0 ? data.recentActivity.map((activity: any) => (
            <ActivityRow
              key={activity.id}
              type={activity.type || 'deposit'}
              description={activity.description || activity.type || 'Transaction'}
              amount={formatCurrency(activity.amount || 0)}
              date={activity.created_at ? formatDate(activity.created_at) : 'N/A'}
              status={activity.status || 'completed'}
            />
          )) : (
            <p className="text-brand-text-secondary text-sm">No recent activity</p>
          )}
        </div>
      </GlassCard>

      {/* Loan Application Status */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Loan Application Status</h3>
            <p className="text-brand-text-secondary text-sm">Track your pending applications</p>
          </div>
        </div>
        <div className="space-y-4">
          {data.pendingApplications.length > 0 ? data.pendingApplications.map((app: any) => (
            <ApplicationStatusCard
              key={app.id}
              applicationId={app.loan_ref || 'N/A'}
              amount={formatCurrency(app.amount_requested || 0)}
              purpose={app.purpose || 'Loan Application'}
              submittedDate={app.created_at ? formatDate(app.created_at) : 'N/A'}
              currentStage={app.current_stage ?? 1}
              totalStages={app.total_stages ?? 3}
              statusLabel={employeeStageLabel(app.current_stage ?? 1, app.status ?? 'pending')}
            />
          )) : (
            <p className="text-brand-text-secondary text-sm">No pending applications</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, color, href }: any) {
  const router = useRouter();
  return (
    <GlassCard
      className="p-5 hover:bg-brand-hover transition-all cursor-pointer group"
      onClick={() => href && router.push(href)}
    >
      <div className={`p-3 rounded-lg ${color} mb-4 group-hover:scale-110 transition-transform flex items-center justify-center w-12 h-12`}>
        {title === "Apply Loan"
          ? <span className="text-lg font-bold leading-none">GH₵</span>
          : <Icon className="w-6 h-6" />}
      </div>
      <h4 className="text-brand-text font-semibold mb-1">{title}</h4>
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
            <p className="text-brand-text font-medium">{loanId}</p>
            <p className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
        </div>
        <span className="text-brand-text font-bold text-lg">{amount}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-brand-text-secondary text-xs mb-1">Remaining</p>
          <p className="text-brand-text font-medium">{remainingBalance}</p>
        </div>
        <div>
          <p className="text-brand-text-secondary text-xs mb-1">Monthly</p>
          <p className="text-brand-text font-medium">{monthlyPayment}</p>
        </div>
        <div>
          <p className="text-brand-text-secondary text-xs mb-1">Next Due</p>
          <p className="text-brand-text font-medium">{nextDueDate}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ type, description, amount, date, status }: any) {
  const typeIcons = {
    deposit: PiggyBank,
    payment: BadgeCent,
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
          <p className="text-brand-text font-medium">{description}</p>
          <p className="text-brand-text-secondary text-xs">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-brand-text font-bold ${type === 'withdrawal' ? 'text-brand-danger' : ''}`}>
          {type === 'withdrawal' ? '-' : '+'}{amount}
        </span>
        <StatusIcon className={`w-5 h-5 ${statusColors[status as keyof typeof statusColors]}`} />
      </div>
    </div>
  );
}

function ApplicationStatusCard({
  applicationId,
  amount,
  purpose,
  submittedDate,
  currentStage,
  totalStages,
  statusLabel,
}: {
  applicationId: string;
  amount: string;
  purpose: string;
  submittedDate: string;
  currentStage: number;
  totalStages: number;
  statusLabel: string;
}) {
  const steps = [
    { label: 'Submitted', stage: 0 },
    ...APPROVAL_STAGES.map((s) => ({ label: s.label, stage: s.stage })),
  ];

  return (
    <div className="p-5 rounded-lg bg-brand-card-bg border border-brand-card-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-brand-text font-semibold">{applicationId}</p>
          <p className="text-brand-text-secondary text-sm">{purpose} • {amount}</p>
        </div>
        <div className="text-right">
          <span className="text-brand-accent text-xs font-medium">{statusLabel}</span>
          <p className="text-brand-text-secondary text-xs">{submittedDate}</p>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const isSubmitted = step.stage === 0;
            const isCompleted = isSubmitted || step.stage < currentStage;
            const isCurrent = !isSubmitted && step.stage === currentStage;
            const isPending = !isSubmitted && step.stage > currentStage;

            return (
              <div key={step.label} className="flex flex-col items-center flex-1">
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
                <p className={`text-xs mt-2 text-center ${isCurrent ? 'text-brand-accent font-medium' : 'text-brand-text-secondary'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-brand-card-border -z-10">
          <div
            className="h-full bg-brand-accent transition-all duration-500"
            style={{ width: `${(currentStage / totalStages) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
