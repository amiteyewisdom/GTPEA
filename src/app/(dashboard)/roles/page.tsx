'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Shield, Users, Key, Lock } from 'lucide-react';

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Roles & Permissions</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Manage user roles and system permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-accent/20 text-brand-accent">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-brand-text font-semibold">Super Admin</h3>
              <p className="text-brand-text-secondary text-xs">Full system access</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Key className="w-4 h-4" />
              All permissions
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-success/20 text-brand-success">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-brand-text font-semibold">Administrator</h3>
              <p className="text-brand-text-secondary text-xs">Daily operations</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Employee management
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Loan approvals
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-warning/20 text-brand-warning">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-brand-text font-semibold">Chairperson</h3>
              <p className="text-brand-text-secondary text-xs">Executive oversight</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Final approvals
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Financial reports
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-text">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-brand-text font-semibold">Fund Manager</h3>
              <p className="text-brand-text-secondary text-xs">Fund management</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Loan reviews
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Disbursements
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-text">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-brand-text font-semibold">Union Rep</h3>
              <p className="text-brand-text-secondary text-xs">Employee representation</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Loan recommendations
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Employee eligibility
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-text">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-brand-text font-semibold">Employee</h3>
              <p className="text-brand-text-secondary text-xs">Member access</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              Apply for loans
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <Lock className="w-4 h-4" />
              View savings
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
