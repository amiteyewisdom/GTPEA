'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ApplyLoanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Apply for Loan</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Submit a new loan application</p>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-brand-text mb-4">Loan Application Form</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-card-bg">
            <FileText className="w-5 h-5 text-brand-accent" />
            <div className="flex-1">
              <p className="text-brand-text font-medium text-sm">Loan application form will be available soon</p>
              <p className="text-brand-text-secondary text-xs">-</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Loan Requirements</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <CheckCircle className="w-5 h-5 text-brand-success" />
              <p className="text-brand-text text-sm">Minimum 6 months membership</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <CheckCircle className="w-5 h-5 text-brand-success" />
              <p className="text-brand-text text-sm">Active contribution status</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Important Notes</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <AlertCircle className="w-5 h-5 text-brand-warning" />
              <p className="text-brand-text text-sm">Review terms before applying</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <AlertCircle className="w-5 h-5 text-brand-warning" />
              <p className="text-brand-text text-sm">Ensure all documents are ready</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
