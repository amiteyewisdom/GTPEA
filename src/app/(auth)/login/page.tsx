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
      
      {/* LEFT SIDE: Background + Cup Overlay - Desktop Only */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative items-center justify-center overflow-hidden">
        {/* Blue Background Image */}
        <Image
          src="/images/login-bg.jpg"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1280px) 55vw, 60vw"
        />
        
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Centered Cup/Coins/Plant Overlay */}
        <div className="relative z-10 w-[70%] max-w-md">
          <Image
            src="/images/cup-coins.png"
            alt="Financial Growth"
            width={500}
            height={600}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Left Side Branding - Bottom Left */}
        <div className="absolute bottom-8 left-8 z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 border-2 border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold bg-white/90 shadow-sm backdrop-blur-sm">
              <BadgeCent className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
              GTPEA <span className="text-[#e6c9a0]">Finance</span>
            </span>
          </div>
          <p className="text-sm text-white/90 max-w-xs leading-relaxed drop-shadow-md mb-4">
            Enterprise financial operations and lending platform
          </p>
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-[#e6c9a0] w-5 h-5 mt-0.5 drop-shadow" />
            <p className="text-xs font-medium text-white/80 leading-snug drop-shadow">
              Secure access with enterprise <br /> grade encryption
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Green Login Card */}
      <div className="w-full lg:w-[45%] xl:w-[40%] min-h-screen flex items-center justify-center bg-[#2D7A4D] p-6 relative">
        {/* Mobile: Show background image with cup overlay */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="/images/login-bg.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
          {/* Mobile cup overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Image
              src="/images/cup-coins.png"
              alt=""
              width={300}
              height={400}
              className="w-[60%] h-auto object-contain"
            />
          </div>
        </div>

        {/* Mobile Branding Header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2 z-10">
          <div className="w-8 h-8 border-2 border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold bg-white/90 shadow-sm backdrop-blur-sm">
            <BadgeCent className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white drop-shadow">
            GTPEA <span className="text-[#e6c9a0]">Finance</span>
          </span>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[2rem] p-6 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          
          {/* Logo Icon */}
          <div className="flex justify-center mb-4">
            {/* Mobile: Text logo */}
            <div className="block lg:hidden">
              <span className="text-2xl font-black tracking-tighter text-[#1e5a36]">GTPEA</span>
            </div>
            {/* Desktop: C icon */}
            <div className="hidden lg:flex w-14 h-14 bg-white border border-gray-100 rounded-xl items-center justify-center text-[#b59a6d] shadow-sm">
              <BadgeCent className="w-7 h-7" />
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

        {/* Desktop Copyright - bottom right of green area */}
        <div className="absolute bottom-6 right-6 hidden lg:block">
          <span className="text-xs text-white/60">
            © {new Date().getFullYear()} GTPEA Finance
          </span>
        </div>
      </div>
    </main>
  );
}
