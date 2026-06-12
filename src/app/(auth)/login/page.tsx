"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, EyeOff, Eye, ShieldCheck, BadgeCent } from 'lucide-react';
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
      
      {/* LEFT SIDE: Image Section - Desktop Only */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative bg-gradient-to-br from-slate-50 to-slate-100 items-center justify-center overflow-hidden">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(45,122,77,0.05)_0%,transparent_50%)]" />
        
        {/* Centered Growth Image */}
        <div className="relative w-full max-w-lg xl:max-w-xl px-12">
          <Image
            src="/images/growth-coins.png"
            alt="Financial Growth"
            width={600}
            height={600}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Left Side Branding - Bottom Left */}
        <div className="absolute bottom-8 left-8 text-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 border-2 border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold bg-white shadow-sm">
              <BadgeCent className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              GTPEA <span className="text-[#b59a6d]">Finance</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Enterprise financial operations and lending platform
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Card */}
      <div className="w-full lg:w-[45%] xl:w-[40%] min-h-screen flex items-center justify-center bg-[#f5f5f5] p-6 relative">
        {/* Mobile Branding Header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 border-2 border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold bg-white shadow-sm">
            <BadgeCent className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">
            GTPEA <span className="text-[#b59a6d]">Finance</span>
          </span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100">
          
          {/* Logo Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#f8fafc] to-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
              <BadgeCent className="w-8 h-8 text-[#b59a6d]" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to access your enterprise finance dashboard securely.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 ml-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kay@tsg.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] transition-all text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] transition-all text-sm text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2D7A4D] focus:ring-[#2D7A4D]" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-[#2D7A4D] font-semibold hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a2540] hover:bg-[#061824] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 text-sm mt-2"
            >
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
          </form>

          {/* Security Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise grade security</span>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Your data is encrypted in transit and at rest
            </p>
          </div>
        </div>

        {/* Copyright - Desktop Only */}
        <div className="absolute bottom-6 right-6 hidden lg:block">
          <span className="text-xs text-slate-400">
            © {new Date().getFullYear()} GTPEA Finance
          </span>
        </div>
      </div>
    </main>
  );
}
