'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Settings, Database, Bell, Shield, Globe } from 'lucide-react';

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">System Settings</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 hover:bg-brand-hover transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-accent/20 text-brand-accent">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-brand-text font-semibold">Database</h3>
          </div>
          <p className="text-brand-text-secondary text-sm mb-4">Manage database connections and backups</p>
        </GlassCard>

        <GlassCard className="p-6 hover:bg-brand-hover transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-success/20 text-brand-success">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-brand-text font-semibold">Notifications</h3>
          </div>
          <p className="text-brand-text-secondary text-sm mb-4">Configure system notifications and alerts</p>
        </GlassCard>

        <GlassCard className="p-6 hover:bg-brand-hover transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-warning/20 text-brand-warning">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-brand-text font-semibold">Security</h3>
          </div>
          <p className="text-brand-text-secondary text-sm mb-4">Manage security policies and access controls</p>
        </GlassCard>

        <GlassCard className="p-6 hover:bg-brand-hover transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-brand-card-bg text-brand-text">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-brand-text font-semibold">General</h3>
          </div>
          <p className="text-brand-text-secondary text-sm mb-4">System configuration and preferences</p>
        </GlassCard>
      </div>
    </div>
  );
}
