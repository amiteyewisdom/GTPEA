'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { DollarSign, CheckCircle, Clock, Search, Filter } from 'lucide-react';

export default function MyLoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">My Loans</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">View your loan applications and status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-warning">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-brand-text-secondary text-sm">Pending</span>
          </div>
          <p className="text-brand-text text-2xl font-bold">0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-success">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-brand-text-secondary text-sm">Active</span>
          </div>
          <p className="text-brand-text text-2xl font-bold">0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-accent">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-brand-text-secondary text-sm">Total Borrowed</span>
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
              placeholder="Search loans..."
              className="pl-10 pr-4 py-2 bg-brand-card-bg border border-brand-card-border rounded-lg text-brand-text placeholder-brand-text-secondary focus:outline-none focus:border-brand-accent w-64"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-card-bg border border-brand-card-border rounded-lg text-brand-text hover:bg-brand-hover transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-card-bg">
            <DollarSign className="w-5 h-5 text-brand-text-secondary" />
            <div className="flex-1">
              <p className="text-brand-text font-medium text-sm">No loan applications found</p>
              <p className="text-brand-text-secondary text-xs">-</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
