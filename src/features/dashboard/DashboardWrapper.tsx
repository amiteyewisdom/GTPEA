'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import EmployeeDashboard from './EmployeeDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdministratorDashboard from './AdministratorDashboard';
import ChairpersonDashboard from './ChairpersonDashboard';
import FundManagerDashboard from './FundManagerDashboard';
import UnionRepDashboard from './UnionRepDashboard';

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

export default function DashboardWrapper({ role, data, stats }: Props) {
  return (
    <DashboardErrorBoundary>
      {role === 'employee' && <EmployeeDashboard data={data} />}
      {role === 'super_admin' && <SuperAdminDashboard stats={stats} />}
      {role === 'administrator' && <AdministratorDashboard stats={stats} />}
      {role === 'chairperson' && <ChairpersonDashboard stats={stats} />}
      {role === 'fund_manager' && <FundManagerDashboard stats={stats} />}
      {role === 'union_rep' && <UnionRepDashboard stats={stats} />}
    </DashboardErrorBoundary>
  );
}
