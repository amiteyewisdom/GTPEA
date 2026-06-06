"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, EyeOff, Eye, ShieldCheck } from 'lucide-react';
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
    <main className="relative min-h-screen w-full flex items-center justify-center font-sans antialiased overflow-hidden">
      
      {/* SEAMLESS BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/growth-plant.jpeg"
          alt="Growth"
          fill
          className="object-contain object-top opacity-90"
          priority
        />
        {/* Soft dark tint so the white card and branding text are readable */}
        <div className="absolute inset-0 bg-black/30 md:bg-black/10 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between">
        
        {/* LEFT SIDE: Branding (Visible only on Desktop) */}
        <div className="hidden lg:flex flex-col text-white max-w-md drop-shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-[2px] border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold text-xl bg-white/10 backdrop-blur-md">
              C
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              GTPEA <span className="text-[#b59a6d]">Finance</span>
            </h1>
          </div>
          <p className="text-base font-medium opacity-90 leading-tight mb-4">
            Enterprise financial operations <br /> and lending platform
          </p>
          <div className="h-[2px] w-12 bg-[#b59a6d] mb-8" />
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-[#b59a6d] w-6 h-6 mt-0.5" />
            <p className="text-[14px] font-medium leading-snug opacity-90">
              Secure access with enterprise <br /> grade encryption
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Shorter White Card */}
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            
            {/* LOGO LOGIC */}
            <div className="flex justify-center mb-4">
              {/* GTPEA Text for Mobile */}
              <div className="block lg:hidden">
                <span className="text-2xl font-black tracking-tighter text-[#1e5a36]">GTPEA</span>
              </div>
              {/* "C" Icon for Desktop */}
              <div className="hidden lg:flex w-14 h-14 bg-white border border-gray-100 rounded-xl items-center justify-center text-[#b59a6d] shadow-sm">
                <span className="text-2xl font-serif font-bold">C</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-[22px] lg:text-[26px] font-bold text-[#1e5a36] leading-none mb-1">Welcome back</h2>
              <p className="text-[12px] text-gray-400">Sign in to your account</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 p-2.5 text-[11px] text-red-700 text-center border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wide">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D7A4D]/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kay@gtpea.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] transition-all text-sm text-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D7A4D] transition-all text-sm text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#2D7A4D]" />
                  <span className="text-gray-500 font-medium">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-[#2D7A4D] font-bold">Forgot?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D7A4D] hover:bg-[#23633b] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-1"
              >
                {loading ? 'Verifying...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                © {new Date().getFullYear()} GTPEA Finance Platform. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
