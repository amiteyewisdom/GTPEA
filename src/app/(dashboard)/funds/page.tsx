'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Wallet, TrendingUp, DollarSign, PieChart } from 'lucide-react';

export default function FundsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Funds Management</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Overview of fund allocations and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-accent">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Total Fund Balance</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-success">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Investment Returns</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-warning">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Available for Loans</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-text">
              <PieChart className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Reserve Fund</p>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-brand-text mb-4">Fund Allocation</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-accent" />
              <span className="text-brand-text font-medium">Loan Portfolio</span>
            </div>
            <span className="text-brand-text font-bold">0%</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-success" />
              <span className="text-brand-text font-medium">Investments</span>
            </div>
            <span className="text-brand-text font-bold">0%</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-warning" />
              <span className="text-brand-text font-medium">Reserves</span>
            </div>
            <span className="text-brand-text font-bold">0%</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-brand-card-border" />
              <span className="text-brand-text font-medium">Operating Expenses</span>
            </div>
            <span className="text-brand-text font-bold">0%</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
