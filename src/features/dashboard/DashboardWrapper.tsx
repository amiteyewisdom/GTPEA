'use client';

import React, { Component, ErrorInfo, ReactNode, Suspense, lazy } from 'react';

interface Props {
  role: string;
  data?: any;
  stats?: any;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DashboardErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Dashboard Error</h1>
          <p className="text-gray-600 mb-2">Failed to load dashboard component.</p>
          <p className="text-sm text-gray-500">Error: {this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamic imports to isolate component loading errors
const EmployeeDashboard = lazy(() => import('./EmployeeDashboard').catch(e => {
  console.error('Failed to load EmployeeDashboard:', e);
  return { default: () => <div>Error loading Employee Dashboard</div> };
}));

const SuperAdminDashboard = lazy(() => import('./SuperAdminDashboard').catch(e => {
  console.error('Failed to load SuperAdminDashboard:', e);
  return { default: () => <div>Error loading Super Admin Dashboard</div> };
}));

const AdministratorDashboard = lazy(() => import('./AdministratorDashboard').catch(e => {
  console.error('Failed to load AdministratorDashboard:', e);
  return { default: () => <div>Error loading Administrator Dashboard</div> };
}));

const ChairpersonDashboard = lazy(() => import('./ChairpersonDashboard').catch(e => {
  console.error('Failed to load ChairpersonDashboard:', e);
  return { default: () => <div>Error loading Chairperson Dashboard</div> };
}));

const FundManagerDashboard = lazy(() => import('./FundManagerDashboard').catch(e => {
  console.error('Failed to load FundManagerDashboard:', e);
  return { default: () => <div>Error loading Fund Manager Dashboard</div> };
}));

const UnionRepDashboard = lazy(() => import('./UnionRepDashboard').catch(e => {
  console.error('Failed to load UnionRepDashboard:', e);
  return { default: () => <div>Error loading Union Rep Dashboard</div> };
}));

export default function DashboardWrapper({ role, data, stats }: Props) {
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
        {role === 'employee' && <EmployeeDashboard data={data} />}
        {role === 'super_admin' && <SuperAdminDashboard stats={stats} />}
        {role === 'administrator' && <AdministratorDashboard stats={stats} />}
        {role === 'chairperson' && <ChairpersonDashboard stats={stats} />}
        {role === 'fund_manager' && <FundManagerDashboard stats={stats} />}
        {role === 'union_rep' && <UnionRepDashboard stats={stats} />}
      </Suspense>
    </DashboardErrorBoundary>
  );
}
