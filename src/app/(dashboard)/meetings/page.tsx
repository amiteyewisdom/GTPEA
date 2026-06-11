'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Calendar, Clock, Plus, Users } from 'lucide-react';

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">Meetings</h1>
          <p className="text-sm md:text-base text-brand-text-secondary">Schedule and manage board meetings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-primary rounded-lg font-medium hover:bg-brand-accent/90 transition-all">
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Upcoming Meetings</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-card-bg">
              <Calendar className="w-5 h-5 text-brand-accent" />
              <div className="flex-1">
                <p className="text-brand-text font-medium text-sm">No upcoming meetings</p>
                <p className="text-brand-text-secondary text-xs">-</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-brand-text mb-4">Past Meetings</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-card-bg">
              <Clock className="w-5 h-5 text-brand-text-secondary" />
              <div className="flex-1">
                <p className="text-brand-text font-medium text-sm">No past meetings</p>
                <p className="text-brand-text-secondary text-xs">-</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
