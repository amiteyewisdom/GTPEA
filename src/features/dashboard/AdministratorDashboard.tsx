'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  PiggyBank, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function AdministratorDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'imports' | 'exports'>('overview');

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard
              title="Active Employees"
              value="1,247"
              change="+5.2%"
              trend="up"
              icon={Users}
              color="text-brand-accent"
            />
            <KPICard
              title="Pending Loans"
              value="45"
              change="-12.3%"
              trend="down"
              icon={DollarSign}
              color="text-brand-warning"
            />
            <KPICard
              title="Approved Loans"
              value="892"
              change="+8.7%"
              trend="up"
              icon={CheckCircle}
              color="text-brand-success"
            />
            <KPICard
              title="Total Savings"
              value="₵2.4M"
              change="+6.1%"
              trend="up"
              icon={PiggyBank}
              color="text-brand-success"
            />
            <KPICard
              title="Withdrawals"
              value="₵125K"
              change="+3.4%"
              trend="up"
              icon={TrendingUp}
              color="text-brand-warning"
            />
            <KPICard
              title="Dividends"
              value="₵45K"
              change="+18.2%"
              trend="up"
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
              <ActivityRow
                action="Employee Import"
                description="25 employees imported successfully"
                time="2 hours ago"
                status="success"
              />
              <ActivityRow
                action="Savings Deposit"
                description="Bulk deposit of ₵50,000 processed"
                time="4 hours ago"
                status="success"
              />
              <ActivityRow
                action="Loan Approval"
                description="15 loans approved in batch"
                time="6 hours ago"
                status="success"
              />
              <ActivityRow
                action="Export Generated"
                description="Monthly report exported to Excel"
                time="1 day ago"
                status="success"
              />
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'imports' && (
        <div className="space-y-6">
          <ImportSection
            title="Import Employees"
            description="Upload employee data from Excel (.xlsx, .xls, .csv)"
            accept=".xlsx,.xls,.csv"
          />
          <ImportSection
            title="Import Savings"
            description="Bulk upload savings records"
            accept=".xlsx,.xls,.csv"
          />
          <ImportSection
            title="Import Loans"
            description="Bulk upload loan applications"
            accept=".xlsx,.xls,.csv"
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

function ImportSection({ title, description, accept }: any) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-brand-text mb-2">{title}</h3>
      <p className="text-brand-text-secondary text-sm mb-4">{description}</p>
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-card-border hover:border-brand-accent/50'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <FileSpreadsheet className="w-12 h-12 text-brand-accent mx-auto mb-4" />
        <p className="text-brand-text font-medium mb-2">Drag and drop your file here</p>
        <p className="text-brand-text-secondary text-sm mb-4">or</p>
        <label className="inline-block px-6 py-2.5 bg-brand-accent text-brand-primary font-medium rounded-lg cursor-pointer hover:bg-brand-accent/80 transition-all">
          Browse Files
          <input type="file" accept={accept} className="hidden" />
        </label>
        <p className="text-brand-text-secondary text-xs mt-4">
          Supported formats: .xlsx, .xls, .csv
        </p>
      </div>
    </GlassCard>
  );
}

function ExportSection({ title, description, sheets }: any) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-brand-text mb-2">{title}</h3>
      <p className="text-brand-text-secondary text-sm mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {sheets.map((sheet: string) => (
          <span key={sheet} className="px-3 py-1 bg-brand-card-bg border border-brand-card-border rounded-full text-sm text-brand-text">
            {sheet}
          </span>
        ))}
      </div>
      
      <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent/20 text-brand-accent rounded-lg font-medium hover:bg-brand-accent/30 transition-all">
        <Download className="w-4 h-4" />
        Export to Excel
      </button>
    </GlassCard>
  );
}
