'use client';

import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import type { DashboardStats } from '@/lib/dashboard/fetch-stats';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import DataImportPanel from '@/components/data/DataImportPanel';
import { useDownload } from '@/hooks/use-download';
import {
  Users,
  BadgeCent,
  CheckCircle,
  PiggyBank,
  TrendingUp,
  Upload,
  Download,
} from 'lucide-react';

export default function AdministratorDashboard({ stats: initialStats }: { stats: DashboardStats }) {
  const [stats, setStats] = useState(initialStats);
  const [activeTab, setActiveTab] = useState<'overview' | 'imports' | 'exports'>('overview');

  useEffect(() => {
    let cancelled = false;

    fetch('/api/dashboard/stats')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setStats(data as DashboardStats);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Operations Dashboard</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Manage daily operations and data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-card-border pb-4">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview
        </TabButton>
        <TabButton active={activeTab === 'imports'} onClick={() => setActiveTab('imports')}>
          Bulk Import
        </TabButton>
        <TabButton active={activeTab === 'exports'} onClick={() => setActiveTab('exports')}>
          Bulk Export
        </TabButton>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 [&>*]:min-w-0">
            <DashboardStatCard
              title="Active Employees"
              value={formatNumber(stats.totalEmployees)}
              icon={Users}
              color="text-brand-accent"
            />
            <DashboardStatCard
              title="Pending Loans"
              value={formatNumber(stats.pendingLoans)}
              icon={BadgeCent}
              color="text-brand-warning"
            />
            <DashboardStatCard
              title="Approved Loans"
              value={formatNumber(stats.approvedLoans)}
              icon={CheckCircle}
              color="text-brand-success"
            />
            <DashboardStatCard
              title="Total Savings"
              value={formatCurrency(stats.totalSavings)}
              icon={PiggyBank}
              color="text-brand-success"
            />
            <DashboardStatCard
              title="Withdrawals"
              value={formatCurrency(stats.totalWithdrawals)}
              icon={TrendingUp}
              color="text-brand-warning"
            />
            <DashboardStatCard
              title="Dividends"
              value={formatCurrency(stats.totalDividends)}
              icon={TrendingUp}
              color="text-brand-accent"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Import Employees"
              description="Upload employee data from Excel"
              icon={Upload}
              onClick={() => setActiveTab('imports')}
            />
            <QuickActionCard
              title="Import Savings"
              description="Bulk upload savings records"
              icon={Upload}
              onClick={() => setActiveTab('imports')}
            />
            <QuickActionCard
              title="Import Loans"
              description="Bulk upload loan applications"
              icon={Upload}
              onClick={() => setActiveTab('imports')}
            />
            <QuickActionCard
              title="Export Reports"
              description="Generate multi-sheet Excel reports"
              icon={Download}
              onClick={() => setActiveTab('exports')}
            />
          </div>

          {/* Recent Activity */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Recent Operations</h3>
            <div className="space-y-3">
              {stats.recentOperations.length > 0 ? stats.recentOperations.map((item, index) => (
                <ActivityRow
                  key={`${item.action}-${index}`}
                  action={item.action}
                  description={item.description}
                  time={item.time}
                  status={item.status}
                />
              )) : (
                <p className="text-brand-text-secondary text-sm">No recent operations</p>
              )}
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'imports' && (
        <div className="space-y-6">
          <DataImportPanel
            type="employees"
            title="Import Employees"
            description="Add or update staff records from a CSV file."
          />
          <DataImportPanel
            type="savings"
            title="Import Savings"
            description="Upload monthly savings contributions."
          />
          <DataImportPanel
            type="loans"
            title="Import Loans"
            description="Upload loan applications and balances."
          />
        </div>
      )}

      {activeTab === 'exports' && (
        <div className="space-y-6">
          <ExportSection
            title="Generate Comprehensive Report"
            description="Export all data with multiple sheets"
            sheets={['Savings', 'Loans', 'Dividends', 'Withdrawals']}
          />
          <ExportSection
            title="Savings Report"
            description="Export savings data only"
            sheets={['Savings']}
          />
          <ExportSection
            title="Loan Report"
            description="Export loan data only"
            sheets={['Loans']}
          />
          <ExportSection
            title="Dividend Report"
            description="Export dividend data only"
            sheets={['Dividends']}
          />
          <ExportSection
            title="Withdrawal Report"
            description="Export withdrawal data only"
            sheets={['Withdrawals']}
          />
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30'
          : 'text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text'
      }`}
    >
      {children}
    </button>
  );
}

function QuickActionCard({ title, description, icon: Icon, onClick }: any) {
  return (
    <GlassCard 
      className="p-5 hover:bg-brand-hover transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-3 rounded-lg bg-brand-accent/20 text-brand-accent mb-4 group-hover:bg-brand-accent group-hover:text-brand-primary transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-brand-text font-semibold mb-1">{title}</h4>
      <p className="text-brand-text-secondary text-sm">{description}</p>
    </GlassCard>
  );
}

function ActivityRow({ action, description, time, status }: any) {
  const statusColors = {
    success: 'text-brand-success',
    warning: 'text-brand-warning',
    error: 'text-brand-danger',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg">
      <div className="flex-1">
        <p className="text-brand-text text-sm font-medium">{action}</p>
        <p className="text-brand-text-secondary text-xs">{description}</p>
      </div>
      <div className="text-right">
        <p className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </p>
        <p className="text-brand-text-secondary text-xs">{time}</p>
      </div>
    </div>
  );
}

function ExportSection({ title, description, sheets }: { title: string; description: string; sheets: string[] }) {
  const { download, loading } = useDownload();

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-brand-text mb-2">{title}</h3>
      <p className="text-brand-text-secondary text-sm mb-4">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {sheets.map((sheet) => (
          <span key={sheet} className="px-3 py-1 bg-brand-card-bg border border-brand-card-border rounded-full text-sm text-brand-text">
            {sheet}
          </span>
        ))}
      </div>

      <button
        onClick={() => download(`/api/export/data?sheets=${sheets.join(',')}`, 'gtpea_export.csv')}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent/20 text-brand-accent rounded-lg font-medium hover:bg-brand-accent/30 transition-all disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {loading ? 'Exporting...' : 'Download CSV'}
      </button>
    </GlassCard>
  );
}
