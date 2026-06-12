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
    <main className="relative min-h-screen w-full flex items-center justify-center font-sans antialiased overflow-hidden">
      
      {/* FULL PAGE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/login-bg.jpg"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* MOBILE: Show cup in background */}
      <div className="absolute inset-0 lg:hidden flex items-center justify-center z-0">
        <Image
          src="/images/cup-coins.png"
          alt=""
          width={400}
          height={500}
          className="w-[70%] max-w-xs h-auto object-contain opacity-40"
        />
      </div>

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between min-h-screen py-8 lg:py-0">
        
        {/* LEFT SIDE: Branding + Cup (Desktop) / Top (Mobile) */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-start justify-center">
          
          {/* GTPEA Finance - Top Center on Desktop, Top on Mobile */}
          <div className="text-center lg:text-left mb-6 lg:mb-8">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <div className="w-10 h-10 border-2 border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold bg-white/90 shadow-md backdrop-blur-sm">
                <BadgeCent className="w-5 h-5" />
              </div>
              <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                GTPEA <span className="text-[#e6c9a0]">Finance</span>
              </span>
            </div>
            <p className="text-sm text-white/90 drop-shadow-md hidden sm:block">
              Enterprise financial operations and lending platform
            </p>
          </div>

          {/* Cup/Coins/Plant - Hidden on mobile (shown in background), Visible on desktop */}
          <div className="hidden lg:block w-full max-w-md xl:max-w-lg mx-auto lg:mx-0">
            <Image
              src="/images/cup-coins.png"
              alt="Financial Growth"
              width={500}
              height={600}
              className="w-full h-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Security text - Desktop only */}
          <div className="hidden lg:flex items-start gap-3 mt-6 ml-2">
            <ShieldCheck className="text-[#e6c9a0] w-5 h-5 mt-0.5 drop-shadow" />
            <p className="text-sm font-medium text-white/90 leading-snug drop-shadow-md">
              Secure access with enterprise <br /> grade encryption
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Login Card */}
        <div className="w-full lg:w-auto flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-6 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#f8fafc] to-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                <BadgeCent className="w-7 h-7 text-[#b59a6d]" />
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
                    placeholder="admin@gtpea.com"
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

      {/* Bottom Copyright - Desktop */}
      <div className="absolute bottom-4 right-6 hidden lg:block z-10">
        <span className="text-xs text-white/60">
          © {new Date().getFullYear()} GTPEA Finance
        </span>
      </div>
    </main>
  );
}
