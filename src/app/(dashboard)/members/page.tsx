'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Users, Search, Filter, MoreVertical } from 'lucide-react';

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Members</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">View and manage union members</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search members..."
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-card-border">
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Member</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Department</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-brand-card-border">
                <td colSpan={4} className="py-8 text-center text-brand-text-secondary">
                  <Users className="w-12 h-12 mx-auto mb-3 text-brand-text-secondary/50" />
                  <p>No members found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
