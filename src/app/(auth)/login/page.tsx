"use client";

import React, { useState } from 'react';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultPassword = process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD || 'Gtpea@2025';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    // Always sign out any existing session first to prevent stale role/profile bleedover
    await supabase.auth.signOut();

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message || 'Unable to sign in.');
      setLoading(false);
      return;
    }

    // Hard navigate (not router.push) to force a full server-side session refresh.
    // proxy.ts will route to /change-password or /verify-otp first if required.
    window.location.href = '/dashboard';
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased">
      {/* Left brand panel - hidden on mobile, shown on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between bg-gradient-to-br from-brand-green-dark via-brand-green to-brand-green-light text-white p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-white/5 blur-2xl" />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#b59a6d" strokeWidth="2.5" />
              <text x="16" y="21" textAnchor="middle" fill="#b59a6d" fontSize="14" fontWeight="bold" fontFamily="serif">₵</text>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">GTPEA Finance</h1>
            <p className="text-xs text-white/70">GTP Employees Association</p>
          </div>
        </div>

        {/* Middle: Value prop */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Smart financial management for employees
          </h2>
          <p className="text-base text-white/80 mb-10 leading-relaxed">
            Access your savings, loans, dividends, and account statements securely in one place.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Bank-grade security</h3>
                <p className="text-sm text-white/70">Two-factor authentication and encrypted sessions.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Savings & loans</h3>
                <p className="text-sm text-white/70">Track contributions, apply for loans, and view repayments.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Real-time dashboard</h3>
                <p className="text-sm text-white/70">Balances, dividends, and statements at a glance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Footer */}
        <p className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} GTP Employees Association. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-brand-background">
        <div className="w-full max-w-[440px]">
          {/* Mobile-only brand header */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-green-dark mb-4 shadow-md">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="#b59a6d" strokeWidth="2.5" />
                <text x="16" y="21" textAnchor="middle" fill="#b59a6d" fontSize="14" fontWeight="bold" fontFamily="serif">₵</text>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-text">GTPEA Finance</h1>
            <p className="text-sm text-brand-text-secondary mt-1">GTP Employees Association</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-brand-card-border p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-brand-text-secondary mb-8">Enter your credentials to sign in to your account.</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gtpea.com"
                    required
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-brand-green font-medium hover:underline">
                  Forgot password?
                </a>
              </div>

              <div className="rounded-lg bg-brand-green/5 border border-brand-green/10 p-3 text-sm">
                <p className="text-brand-green-dark font-medium mb-0.5">First-time / test account?</p>
                <p className="text-gray-600">
                  Default password is <span className="font-semibold text-gray-900">{defaultPassword}</span>. You’ll be asked to change it after signing in.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-brand-green font-medium hover:underline">
                  Create an account
                </a>
              </p>
            </form>
          </div>

          <p className="hidden lg:block text-center text-xs text-brand-text-secondary mt-6">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
