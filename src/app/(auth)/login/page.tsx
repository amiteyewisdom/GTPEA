"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, EyeOff, Eye, BadgeCent } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message || 'Unable to sign in.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen w-full flex font-sans antialiased">

      {/* ── LEFT PANEL: Illustrated Hero ── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] relative overflow-hidden flex-col justify-between p-10 xl:p-14">

        {/* Background gradient + image */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3320] via-[#1e5a36] to-[#2D7A4D]" />
        <Image
          src="/images/login-bg-new.jpeg"
          alt="GTPEA Hero"
          fill
          className="object-cover object-center opacity-20 mix-blend-overlay"
          priority
          quality={90}
        />

        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] rounded-full bg-[#b59a6d]/20 blur-[100px]" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-[#2D7A4D]/40 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 blur-[60px]" />

        {/* Top branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <BadgeCent className="w-6 h-6 text-[#b59a6d]" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">GTPEA</p>
            <p className="text-white/60 text-xs">Finance Platform</p>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              GTP Employees<br />
              <span className="text-[#b59a6d]">Association</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Your trusted co-operative — managing savings, loans, and financial wellness for every member.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Savings Management', 'Loan Processing', 'Payroll Deductions', 'Dividend Distribution', 'Financial Reports'].map((feat) => (
              <span key={feat} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium">
                {feat}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Members', value: '500+' },
              { label: 'Savings Pool', value: 'GH₵ 2M+' },
              { label: 'Loans Disbursed', value: 'GH₵ 1M+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15 text-center">
                <p className="text-[#b59a6d] text-2xl font-bold">{stat.value}</p>
                <p className="text-white/60 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-white/40 text-sm">
            Secure · Transparent · Member-Owned
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="w-full lg:w-[42%] xl:w-[40%] min-h-screen flex items-center justify-center p-6 lg:p-10 bg-[#f8fafc]">

        {/* Mobile top logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-[#1e5a36] flex items-center justify-center">
            <BadgeCent className="w-5 h-5 text-[#b59a6d]" />
          </div>
          <span className="text-[#1e5a36] font-bold text-sm">GTPEA Finance</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100">

            {/* Card logo */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1e5a36] to-[#2D7A4D] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1e5a36]/30">
                <BadgeCent className="w-7 h-7 text-[#b59a6d]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to GTPEA Finance Platform</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 p-3.5 text-sm text-red-700 text-center border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gtpea.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] transition-all text-sm text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#2D7A4D]" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-[#2D7A4D] font-semibold hover:underline text-xs">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1e5a36] to-[#2D7A4D] hover:from-[#184d2e] hover:to-[#236040] text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-[#2D7A4D]/30 text-sm mt-1 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-400">
                © {new Date().getFullYear()} GTP Employees Association. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
