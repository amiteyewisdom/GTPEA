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
    <main className="relative min-h-screen w-full flex items-center justify-center font-sans antialiased overflow-hidden">
      
      {/* Background Image - Fits all screens */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/growth-plant.jpeg" 
          alt="Growth" 
          fill 
          className="object-cover" 
          priority 
        />
        {/* Soft overlay: Darker on mobile to see white text, Lighter on desktop */}
        <div className="absolute inset-0 bg-black/40 lg:bg-black/10 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* LEFT SIDE: Branding (Restored for Desktop) */}
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
          <div className="h-[2px] w-12 bg-[#b59a6d] mb-12" />
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-[#b59a6d] w-6 h-6 mt-0.5" />
            <p className="text-[15px] font-medium leading-snug opacity-90">
              Secure access with enterprise <br /> grade encryption
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: The Card (Glassy on Mobile, White on Desktop) */}
        <div className="w-full max-w-[460px]">
          <div className="
            /* Mobile Style: Transparent Glass */
            bg-white/5 backdrop-blur-md border border-white/20 
            /* Desktop Style: Solid White (Restored) */
            lg:bg-white/95 lg:backdrop-blur-xl lg:border-transparent lg:shadow-[0_20px_50px_rgba(0,0,0,0.2)]
            rounded-[2.5rem] p-8 lg:p-14 transition-all duration-500
          ">
            
            {/* Logo inside card */}
            <div className="flex justify-center mb-8">
              <div className="px-6 py-2 bg-white/10 lg:bg-white border border-white/20 lg:border-gray-100 rounded-2xl shadow-sm">
                <span className="text-xl font-black tracking-widest text-white lg:text-[#b59a6d]">
                  GTPEA
                </span>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-[28px] font-bold text-white lg:text-[#0a1629] mb-3">Welcome back</h2>
              <p className="text-sm lg:text-[15px] text-gray-200 lg:text-gray-500 leading-relaxed">
                Sign in to your enterprise finance dashboard securely.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-500/20 lg:bg-red-50 border border-red-500/30 lg:border-red-200 p-4 text-sm text-white lg:text-red-700 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/70 lg:text-gray-700 ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 lg:text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kay@tsg.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/5 lg:bg-[#f8fafc] border border-white/20 lg:border-gray-200 rounded-xl text-sm text-white lg:text-black focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/70 lg:text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 lg:text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-white/5 lg:bg-[#f8fafc] border border-white/20 lg:border-gray-200 rounded-xl text-sm text-white lg:text-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 lg:text-gray-400"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black lg:bg-[#051128] lg:text-white font-bold py-4.5 rounded-xl transition-all shadow-lg text-base mt-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/10 lg:border-gray-100 flex items-center justify-center gap-2">
              <LockKeyhole className="w-3.5 h-3.5 text-white/30 lg:text-gray-400" />
              <span className="text-[10px] uppercase tracking-widest text-white/30 lg:text-gray-400 font-bold">
                Enterprise Grade Security
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
        }
