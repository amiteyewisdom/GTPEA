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
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center font-sans antialiased overflow-hidden bg-[#0a0a0a]">
      
      {/* BACKGROUND IMAGE - Fixed positioning to match mockup */}
      <div className="absolute inset-0 z-0 flex items-center justify-start pointer-events-none">
        <div className="relative w-full h-full lg:w-3/4">
          <Image 
            src="/images/growth-plant.jpeg" 
            alt="Growth" 
            fill 
            // 'contain' ensures the image is never cropped (head-to-toe)
            // 'object-left' keeps it on the side like the mockup
            className="object-contain object-left opacity-90" 
            priority 
          />
        </div>
        {/* Soft vignette to help the card pop */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* LEFT SIDE: Branding (Matches Mockup) */}
        <div className="hidden lg:flex flex-col text-white max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 border-[3px] border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-bold text-2xl">
              G
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              GTPEA <span className="text-[#b59a6d]">Finance</span>
            </h1>
          </div>
          <p className="text-lg font-medium opacity-90 leading-tight mb-6">
            Enterprise financial operations <br /> and lending platform
          </p>
          <div className="h-[2.5px] w-12 bg-[#b59a6d] mb-12" />
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full border border-[#b59a6d] flex items-center justify-center flex-shrink-0 mt-0.5">
               <ShieldCheck className="text-[#b59a6d] w-3.5 h-3.5" />
            </div>
            <p className="text-[15px] font-medium leading-snug opacity-90">
              Secure access with enterprise <br /> grade encryption
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: The Crystal Glass Card */}
        <div className="w-full max-w-[460px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2.5rem] p-8 lg:p-14 transition-all duration-300">
            
            {/* LOGO: Displays "GTPEA" inside the card */}
            <div className="flex justify-center mb-8">
              <div className="px-6 py-2 bg-white/10 border border-white/20 rounded-2xl">
                <span className="text-xl font-black tracking-widest text-white">
                  GTPEA
                </span>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
              <p className="text-sm text-gray-300 font-medium">
                Sign in to your enterprise account.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 text-white text-xs rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kay@tsg.com"
                    required
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-[#2D7A4D] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-4 bg-white/10 border border-white/10 rounded-xl text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <a href="/forgot-password" size="sm" className="text-xs text-white/70 hover:text-white font-bold transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* FOREST GREEN BUTTON (Restored from Mockup) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D7A4D] hover:bg-[#23633b] text-white font-bold py-4 rounded-xl shadow-lg text-base mt-2 active:scale-[0.98] transition-all"
              >
                {loading ? 'Processing...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-center gap-2">
              <LockKeyhole className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                Enterprise Grade Security
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
