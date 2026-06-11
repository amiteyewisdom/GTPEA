'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Users, DollarSign, PiggyBank, Wallet, Activity, TrendingUp } from 'lucide-react';

export default function SuperAdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Super Admin Overview</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">System-wide overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-accent">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+5.2%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Total Users</p>
          <p className="text-brand-text text-2xl font-bold">0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-success">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+3.8%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Total Loans</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-accent">
              <PiggyBank className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+8.1%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Total Savings</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-warning">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+2.4%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Fund Balance</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <Activity className="w-5 h-5 text-brand-accent" />
              <div className="flex-1">
                <p className="text-brand-text font-medium text-sm">System initialized</p>
                <p className="text-brand-text-secondary text-xs">Just now</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg">
              <span className="text-brand-text-secondary text-sm">Database Status</span>
              <span className="text-brand-success text-sm font-medium">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg">
              <span className="text-brand-text-secondary text-sm">API Status</span>
              <span className="text-brand-success text-sm font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-brand-card-bg">
              <span className="text-brand-text-secondary text-sm">Storage Usage</span>
              <span className="text-brand-warning text-sm font-medium">0%</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
