'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Activity, Search, Filter, Clock } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Audit Logs</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Track system activities and changes</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search logs..."
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
          <div className="flex items-center gap-4 p-4 rounded-lg bg-brand-card-bg">
            <Activity className="w-5 h-5 text-brand-accent" />
            <div className="flex-1">
              <p className="text-brand-text font-medium text-sm">System initialized</p>
              <p className="text-brand-text-secondary text-xs">Admin</p>
            </div>
            <div className="flex items-center gap-2 text-brand-text-secondary text-xs">
              <Clock className="w-4 h-4" />
              Just now
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
