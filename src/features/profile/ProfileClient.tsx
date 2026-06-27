"use client";

import { useState } from "react";
import { Edit2, Save, X, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";

interface ProfileData {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
}

interface ProfileClientProps {
  profile: ProfileData | null;
  email: string;
}

const ROLE_BADGE: Record<string, string> = {
  administrator: "bg-violet-100 text-violet-700",
  fund_manager:  "bg-cyan-100 text-cyan-700",
  chairperson:   "bg-amber-100 text-amber-700",
  union_rep:     "bg-green-100 text-green-700",
  employee:      "bg-slate-100 text-slate-600",
};

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const displayRole = profile?.role === "super_admin" ? "administrator" : (profile?.role ?? "employee");
  const roleBadge = ROLE_BADGE[displayRole] ?? ROLE_BADGE.employee;
  const initial = (fullName?.[0] ?? "U").toUpperCase();

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    const supabase = createClient() as any;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", profile!.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." });
      setEditing(false);
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setEditing(false);
  };

  const handlePasswordReset = async () => {
    const supabase = createClient();
    await (supabase as any).auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setMessage({ type: "success", text: "Password reset email sent. Check your inbox." });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      {message && (
        <div className={`flex items-center gap-2 rounded-lg border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Header */}
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 text-2xl font-bold text-brand-green ring-2 ring-brand-green/20">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-brand-text truncate">{fullName || "—"}</h2>
            <p className="text-sm text-brand-text-secondary truncate">{email}</p>
            <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadge}`}>
              {displayRole.replace("_", " ")}
            </span>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-accent/90"
            >
              <Edit2 className="h-4 w-4" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-card-border px-4 py-2 text-sm text-brand-text hover:bg-brand-hover"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </GlassCard>

      {/* Account Details */}
      <GlassCard className="p-5">
        <h3 className="mb-4 text-base font-bold text-brand-text">Account Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!editing}
              className="w-full rounded-lg border border-brand-card-border bg-white px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green disabled:bg-slate-50 disabled:text-brand-text"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-brand-card-border bg-slate-50 px-3 py-2.5 text-sm text-brand-text"
            />
            <p className="mt-1 text-xs text-brand-text-secondary">Email cannot be changed here</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              placeholder="+233 000 000 000"
              className="w-full rounded-lg border border-brand-card-border bg-white px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green disabled:bg-slate-50 disabled:text-brand-text"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">Employee ID</label>
            <input
              type="text"
              value={profile?.employee_id ?? "—"}
              disabled
              className="w-full rounded-lg border border-brand-card-border bg-slate-50 px-3 py-2.5 text-sm font-mono text-brand-text"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">Role</label>
            <input
              type="text"
              value={displayRole.replace("_", " ")}
              disabled
              className="w-full rounded-lg border border-brand-card-border bg-slate-50 px-3 py-2.5 text-sm capitalize text-brand-text"
            />
          </div>
        </div>

        {editing && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-brand-green/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </GlassCard>

      {/* Security */}
      <GlassCard className="p-5">
        <h3 className="mb-4 text-base font-bold text-brand-text">Security</h3>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-text">Password</p>
            <p className="text-xs text-brand-text-secondary">Keep your account secure by updating your password regularly.</p>
          </div>
          <button
            onClick={handlePasswordReset}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-card-border px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-hover"
          >
            <Lock className="h-4 w-4" /> Reset Password
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
