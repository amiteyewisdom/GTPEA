'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { PiggyBank, Plus, Search, Filter, Download } from 'lucide-react';

export default function SavingsHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Savings History</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">View your savings contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-success">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="text-brand-text-secondary text-sm">Total Savings</span>
          </div>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-accent">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-brand-text-secondary text-sm">This Month</span>
          </div>
          <p className="text-brand-text text-2xl font-bold">₵0</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 bg-brand-card-bg border border-brand-card-border rounded-lg text-brand-text placeholder-brand-text-secondary focus:outline-none focus:border-brand-accent w-64"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-card-bg border border-brand-card-border rounded-lg text-brand-text hover:bg-brand-hover transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-card-bg border border-brand-card-border rounded-lg text-brand-text hover:bg-brand-hover transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-card-bg">
            <PiggyBank className="w-5 h-5 text-brand-text-secondary" />
            <div className="flex-1">
              <p className="text-brand-text font-medium text-sm">No savings transactions found</p>
              <p className="text-brand-text-secondary text-xs">-</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
