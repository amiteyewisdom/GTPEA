'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export default function UnionRepDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Union Representative Dashboard</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Overview of union activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-accent">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Active Members</p>
          <p className="text-brand-text text-2xl font-bold">0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-warning">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Pending Loans</p>
          <p className="text-brand-text text-2xl font-bold">0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-success">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Approved Loans</p>
          <p className="text-brand-text text-2xl font-bold">0</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-text">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-brand-success text-sm font-medium">+0%</span>
          </div>
          <p className="text-brand-text-secondary text-sm mb-1">Pending Reviews</p>
          <p className="text-brand-text text-2xl font-bold">0</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Pending Reviews</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <AlertCircle className="w-5 h-5 text-brand-warning" />
              <div className="flex-1">
                <p className="text-brand-text font-medium text-sm">No pending reviews</p>
                <p className="text-brand-text-secondary text-xs">-</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-card-bg">
              <div className="w-2 h-2 rounded-full bg-brand-success" />
              <div className="flex-1">
                <p className="text-brand-text font-medium text-sm">System initialized</p>
                <p className="text-brand-text-secondary text-xs">Just now</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
