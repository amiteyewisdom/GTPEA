'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { TrendingUp, DollarSign, PiggyBank, Wallet, PieChart } from 'lucide-react';

export default function FinancialOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Financial Overview</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Comprehensive financial performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-accent">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Total Assets</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-success">
              <PiggyBank className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Total Liabilities</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-warning">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Net Income</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-text">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Growth Rate</p>
          <p className="text-brand-text text-2xl font-bold">0%</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-brand-text mb-4">Revenue Breakdown</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-success" />
              <span className="text-brand-text font-medium">Loan Interest</span>
            </div>
            <span className="text-brand-text font-bold">0%</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-accent" />
              <span className="text-brand-text font-medium">Investment Returns</span>
            </div>
            <span className="text-brand-text font-bold">0%</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-warning" />
              <span className="text-brand-text font-medium">Fees</span>
            </div>
            <span className="text-brand-text font-bold">0%</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
