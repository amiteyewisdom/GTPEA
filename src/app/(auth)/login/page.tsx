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
    <main className="min-h-screen w-full flex items-center justify-end font-sans antialiased">
      
      {/* FULL PAGE BACKGROUND IMAGE */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/login-bg-new.jpeg"
          alt="GTPEA Finance Background"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
      </div>

      {/* LOGIN CARD - Positioned on the right */}
      <div className="relative z-10 w-full lg:w-[45%] xl:w-[40%] min-h-screen flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-[2rem] p-8 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#f8fafc] to-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
              <BadgeCent className="w-8 h-8 text-[#1e5a36]" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-[28px] font-bold text-[#1e5a36] leading-tight mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 ml-1 uppercase tracking-wide">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D7A4D]/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gtpea.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 ml-1 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/20 focus:border-[#2D7A4D] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2D7A4D]" />
                <span className="text-gray-600 font-medium">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-[#2D7A4D] font-semibold hover:underline">Forgot?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D7A4D] hover:bg-[#23633b] text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-[#2D7A4D]/25 text-sm mt-2"
            >
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-400 font-medium">
              © {new Date().getFullYear()} GTPEA Finance Platform. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
