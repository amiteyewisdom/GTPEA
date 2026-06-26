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
    <main className="relative min-h-screen w-full flex items-center justify-end font-sans antialiased overflow-hidden">

      {/* ── FULL-PAGE BACKGROUND IMAGE ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/login-bg-new.jpeg"
          alt="GTPEA background"
          fill
          className="object-cover object-center"
          priority
          quality={95}
        />
        {/* Green-tinted overlay matching GTPEA colour scheme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3320]/80 via-[#1e5a36]/60 to-[#1e5a36]/30" />
      </div>

      {/* ── BOTTOM-LEFT BRANDING (overlaid on background) ── */}
      <div className="absolute bottom-12 left-10 z-10 hidden lg:block">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
            <BadgeCent className="w-5 h-5 text-[#b59a6d]" />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">GTPEA </span>
            <span className="text-[#b59a6d] font-bold text-xl">Finance</span>
          </div>
        </div>
        <p className="text-white/80 text-sm leading-relaxed max-w-[260px] mb-6">
          Enterprise financial operations<br />and lending platform
        </p>
        <div className="w-8 h-0.5 bg-[#b59a6d] mb-6" />
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 w-5 h-5 rounded-full border border-white/40 flex items-center justify-center shrink-0">
            <Lock className="w-2.5 h-2.5 text-white/70" />
          </div>
          <p className="text-white/60 text-xs leading-relaxed">
            Secure access with enterprise<br />grade encryption
          </p>
        </div>
      </div>

      {/* ── FLOATING LOGIN CARD (right side) ── */}
      <div className="relative z-10 w-full sm:w-auto sm:mr-12 lg:mr-20 xl:mr-28 flex items-center justify-center p-4 sm:p-0 min-h-screen sm:min-h-0">
        <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.22)] p-8 lg:p-10">

          {/* Card icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#f8f5f0] border border-[#e8e0d0] flex items-center justify-center">
              <BadgeCent className="w-7 h-7 text-[#b59a6d]" />
            </div>
          </div>

          <div className="text-center mb-7">
            <h2 className="text-[26px] font-bold text-gray-900 mb-2 leading-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sign in to access your enterprise<br />finance dashboard securely.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kay@tsg.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e5a36]/20 focus:border-[#1e5a36] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e5a36]/20 focus:border-[#1e5a36] transition-all text-sm text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#1e5a36]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-[#2D7A4D] font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Sign in button — GTPEA green */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e5a36] hover:bg-[#184d2e] text-white font-semibold py-3.5 rounded-xl transition-all text-sm mt-1 disabled:opacity-60 shadow-lg shadow-[#1e5a36]/25"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer security note */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-xs text-gray-400 font-medium">Enterprise grade security</p>
            <div className="flex items-center justify-center gap-1.5 text-gray-400">
              <Lock className="w-3 h-3" />
              <span className="text-xs">Your data is encrypted in transit and at rest</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
