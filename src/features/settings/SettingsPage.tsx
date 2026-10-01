'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/lib/role-menus';

interface SettingsPageProps {
  currentRole: UserRole;
}

export default function SettingsPage({ currentRole: _currentRole }: SettingsPageProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-brand-text-secondary">Manage your account security</p>
      </div>

      <SecuritySettings />
    </div>
  );
}

function SecuritySettings() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load sessions.');
      setSessions(data.sessions || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not revoke session.');
      toast.success('Session signed out');
      await fetchSessions();
    } catch (err: any) {
      toast.error('Could not revoke session', { description: err?.message });
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-brand-accent" />
          <h2 className="text-xl font-semibold text-white">Password</h2>
        </div>
        <p className="text-brand-text-secondary text-sm">
          Passwords are managed by your administrator. If you forget your password,
          contact them — they will reset your account to the default password and
          you will be asked to set a new one on your next login.
        </p>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Active Sessions</h2>
        {loading ? (
          <p className="text-brand-text-secondary text-sm">Loading sessions...</p>
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : sessions.length === 0 ? (
          <p className="text-brand-text-secondary text-sm">No active sessions</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                device={`${session.browser}${session.device_model ? ` on ${session.device_model}` : ''}`}
                location={`${session.location_city}${session.location_region ? `, ${session.location_region}` : ''}, ${session.location_country}`}
                time={session.is_current ? 'Current session' : formatTimeAgo(session.created_at)}
                current={session.is_current}
                onRevoke={() => handleRevokeSession(session.id)}
              />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function SessionItem({ device, location, time, current, onRevoke }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-brand-card-bg border border-brand-card-border">
      <div>
        <p className="text-white font-medium">{device || 'Unknown device'}</p>
        <p className="text-brand-text-secondary text-sm">{location || 'Unknown location'} · {time}</p>
      </div>
      {current ? (
        <span className="text-brand-accent text-xs font-semibold px-3 py-1 rounded-full bg-brand-accent/10">
          This device
        </span>
      ) : (
        <button
          onClick={onRevoke}
          className="inline-flex items-center gap-1.5 text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-400/30 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      )}
    </div>
  );
}
