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
  UserCheck
} from 'lucide-react';

export default function UnionRepDashboard({ stats }: { stats: DashboardStats }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

      {/* Link to loan reviews page */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Loan Reviews</h3>
            <p className="text-brand-text-secondary text-sm">Review and approve pending loan applications</p>
          </div>
          <button
            onClick={() => router.push('/loan-reviews')}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
          >
            Go to Loan Reviews
          </button>
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

