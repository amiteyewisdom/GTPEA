'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import type { DashboardStats } from '@/lib/dashboard/fetch-stats';
import { formatNumber } from '@/utils/formatters';
import {
  CheckCircle,
  XCircle,
  Star,
  ClipboardList,
  BadgeCent,
  PiggyBank,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function UnionRepDashboard({ stats }: { stats: DashboardStats }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApproval = async (approvalId: string, action: 'approved' | 'rejected' | 'on_hold') => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/approvals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_id: approvalId,
          action: action === 'on_hold' ? 'rejected' : action,
          notes: '',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to process approval');
      }

      setMessage({ type: 'success', text: payload.message || `Loan ${action} successfully` });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Approval failed' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Trustee Dashboard</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Review and recommend loan applications</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Pending Reviews"
          value={formatNumber(stats.unionRepStats.pendingReviews)}
          change={`${stats.unionRepStats.pendingReviews}`}
          trend="up"
          icon={ClipboardList}
          color="text-brand-warning"
        />
        <DashboardStatCard
          title="Approved Reviews"
          value={formatNumber(stats.unionRepStats.approvedReviews)}
          change={`${stats.unionRepStats.approvedReviews}`}
          trend="up"
          icon={CheckCircle}
          color="text-brand-success"
        />
        <DashboardStatCard
          title="Rejected Reviews"
          value={formatNumber(stats.unionRepStats.rejectedReviews)}
          change={`${stats.unionRepStats.rejectedReviews}`}
          trend="up"
          icon={XCircle}
          color="text-brand-danger"
        />
      </div>

      {/* Employee Eligibility Queue */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Employee Eligibility Queue</h3>
            <p className="text-brand-text-secondary text-sm">Review loan eligibility for each employee</p>
          </div>
          <UserCheck className="w-5 h-5 text-brand-accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.unionRepLoans.length > 0 ? stats.unionRepLoans.map((loan) => (
            <EmployeeEligibilityCard
              key={loan.id}
              name={loan.name}
              employeeId={loan.employeeId}
              currentSavings={loan.currentSavings}
              currentLoans={loan.currentLoans}
              monthlyRepayments={loan.monthlyRepayments}
              loanHistory={loan.loanHistory}
              eligibilityScore={loan.eligibilityScore}
              status={loan.status}
              onApprove={(action: 'approved' | 'rejected' | 'on_hold') => handleApproval(loan.approvalId, action)}
              loading={loading}
            />
          )) : (
            <p className="text-brand-text-secondary text-sm col-span-full">No pending loan reviews</p>
          )}
        </div>
      </GlassCard>

      {/* Recent Recommendations */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Recent Recommendations</h3>
            <p className="text-brand-text-secondary text-sm">Your latest recommendations</p>
          </div>
          <Star className="w-5 h-5 text-brand-accent" />
        </div>
        <div className="space-y-3">
          {stats.recentRecommendations.length > 0 ? stats.recentRecommendations.map((item, index) => (
            <RecommendationRow
              key={`${item.employee}-${index}`}
              employee={item.employee}
              action={item.action}
              amount={item.amount}
              date={item.date}
              status={item.status}
            />
          )) : (
            <p className="text-brand-text-secondary text-sm">No recent recommendations</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function EmployeeEligibilityCard({
  name,
  employeeId,
  currentSavings,
  currentLoans,
  monthlyRepayments,
  loanHistory,
  eligibilityScore,
  status,
  onApprove,
  loading
}: any) {
  const statusConfig = {
    eligible: {
      color: 'text-brand-success',
      bgColor: 'bg-brand-success/20',
      borderColor: 'border-brand-success/30',
      label: 'Eligible'
    },
    review: {
      color: 'text-brand-warning',
      bgColor: 'bg-brand-warning/20',
      borderColor: 'border-brand-warning/30',
      label: 'Review Required'
    },
    caution: {
      color: 'text-brand-warning',
      bgColor: 'bg-brand-warning/20',
      borderColor: 'border-brand-warning/30',
      label: 'Caution'
    },
    ineligible: {
      color: 'text-brand-danger',
      bgColor: 'bg-brand-danger/20',
      borderColor: 'border-brand-danger/30',
      label: 'Not Eligible'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div className={`p-5 rounded-lg bg-brand-card-bg border ${config.borderColor} hover:bg-brand-hover transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="text-brand-text font-semibold">{name}</h4>
            <p className="text-brand-text-secondary text-xs">{employeeId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricItem icon={PiggyBank} label="Savings" value={currentSavings} />
        <MetricItem icon={BadgeCent} label="Loans" value={currentLoans} />
        <MetricItem icon={TrendingUp} label="Monthly Repayment" value={monthlyRepayments} />
        <MetricItem icon={Star} label="Eligibility Score" value={`${eligibilityScore}%`} highlight={eligibilityScore >= 80} />
      </div>

      {/* Loan History */}
      <div className="mb-4 p-3 rounded-lg bg-brand-card-bg border border-brand-card-border">
        <p className="text-brand-text-secondary text-xs mb-1">Loan History</p>
        <p className="text-brand-text text-sm">{loanHistory}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onApprove && onApprove('approved')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-success/20 text-brand-success rounded-lg text-sm font-medium hover:bg-brand-success/30 transition-all disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => onApprove && onApprove('on_hold')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-warning/20 text-brand-warning rounded-lg text-sm font-medium hover:bg-brand-warning/30 transition-all disabled:opacity-50"
        >
          <Star className="w-4 h-4" />
          Recommend
        </button>
        <button
          onClick={() => onApprove && onApprove('rejected')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-danger/20 text-brand-danger rounded-lg text-sm font-medium hover:bg-brand-danger/30 transition-all disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
}

function MetricItem({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${highlight ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
      <div>
        <p className="text-brand-text-secondary text-xs">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-brand-accent' : 'text-brand-text'}`}>{value}</p>
      </div>
    </div>
  );
}

function RecommendationRow({ employee, action, amount, date, status }: any) {
  const statusColors = {
    approved: 'text-brand-success',
    pending: 'text-brand-warning',
    rejected: 'text-brand-danger',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg hover:bg-brand-hover transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold">
          {employee.charAt(0)}
        </div>
        <div>
          <p className="text-brand-text font-medium">{employee}</p>
          <p className="text-brand-text-secondary text-xs">{action} • {amount}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </p>
        <p className="text-brand-text-secondary text-xs">{date}</p>
      </div>
    </div>
  );
}
