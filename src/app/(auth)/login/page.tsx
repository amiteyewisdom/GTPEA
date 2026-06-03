"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, EyeOff, Eye, ShieldCheck, LockKeyhole } from 'lucide-react';
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
    <main className="relative min-h-screen w-full flex items-center justify-center font-sans antialiased overflow-hidden bg-[#0d121f]">
      
      {/* BACKGROUND IMAGE - Fixed to show head-to-toe without cropping */}
      <div className="absolute inset-0 z-0 flex justify-start items-center">
        <div className="relative w-full h-full lg:w-[60%]">
          <Image 
            src="/images/growth-plant.jpeg" 
            alt="Growth" 
            fill 
            className="object-contain object-left opacity-80" 
            priority 
          />
        </div>
        {/* Shadow to make the right side blend into the card area */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0d121f]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between">
        
        {/* LEFT SIDE: Branding (Desktop) */}
        <div className="hidden lg:flex flex-col text-white max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-[2px] border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold text-xl">
              C
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              GTPEA <span className="text-[#b59a6d]">Finance</span>
            </h1>
          </div>
          <p className="text-base font-medium opacity-80 leading-tight mb-4">
            Enterprise financial operations <br /> and lending platform
          </p>
          <div className="h-[1.5px] w-10 bg-[#b59a6d] mb-8" />
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-[#b59a6d] w-5 h-5 mt-0.5" />
            <p className="text-[14px] font-medium leading-snug opacity-80">
              Secure access with enterprise <br /> grade encryption
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: The Shorter Card */}
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-[1.5rem] p-6 lg:p-10 shadow-2xl">
            
            {/* LOGO: GTPEA on Mobile, "C" Icon on Desktop */}
            <div className="flex justify-center mb-4">
              {/* Mobile View: Text Only */}
              <div className="lg:hidden">
                <span className="text-2xl font-black tracking-tighter text-[#1e5a36]">GTPEA</span>
              </div>
              {/* Desktop View: "C" Icon */}
              <div className="hidden lg:flex w-14 h-14 bg-white border border-gray-100 rounded-xl items-center justify-center text-[#b59a6d] shadow-sm">
                <span className="text-2xl font-serif font-bold">C</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-[24px] font-bold text-[#1e5a36] mb-1">Welcome back</h2>
              <p className="text-[13px] text-gray-500">
                Sign in to your enterprise account.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-700 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#2D7A4D]/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kay@gtpea.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7A4D]/10 focus:border-[#2D7A4D] transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2D7A4D] transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#2D7A4D]" />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>
                <a href="/forgot-password" min-width="fit-content" className="text-[#2D7A4D] font-bold hover:underline">Forgot?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D7A4D] hover:bg-[#23633b] text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
              >
                {loading ? 'Logging in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2">
              <LockKeyhole className="w-3 h-3 text-gray-400" />
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                Secure Access
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
                  }                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#2D7A4D] text-[#2D7A4D] focus:ring-[#2D7A4D]"
                  />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-[#2D7A4D] font-semibold hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D7A4D] hover:bg-[#23633b] text-white font-bold py-4 rounded-xl transition-all shadow-lg text-base mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold whitespace-nowrap">
                  Enterprise grade security
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                <LockKeyhole className="w-3.5 h-3.5" />
                <span>Your data is encrypted in transit and at rest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
