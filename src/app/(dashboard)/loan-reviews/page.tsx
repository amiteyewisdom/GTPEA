'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { CheckCircle, XCircle, Clock, Search, Filter, FileText } from 'lucide-react';

export default function LoanReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Loan Reviews</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Review and process loan applications</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search loan applications..."
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
            <Clock className="w-5 h-5 text-brand-warning" />
            <div className="flex-1">
              <p className="text-brand-text font-medium text-sm">No loan applications to review</p>
              <p className="text-brand-text-secondary text-xs">-</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
