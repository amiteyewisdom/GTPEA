"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, EyeOff, Eye, LockKeyhole } from 'lucide-react';
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
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 font-sans antialiased overflow-hidden">
      {/* Background Image - Scale up slightly for a better look */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/growth-plant.jpeg" 
          alt="BG" 
          fill 
          className="object-cover scale-105" 
          priority 
        />
        {/* Very light tint just to help white text stand out */}
        <div className="absolute inset-0 bg-black/30 sm:bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* THE CRYSTAL GLASS CARD */}
        <div className="bg-white/5 backdrop-blur-[8px] border border-white/20 shadow-2xl rounded-[2.5rem] p-8 sm:p-12 sm:bg-white sm:backdrop-blur-none sm:border-transparent">
          
          {/* LOGO: Changed from "C" to "GTPEA" */}
          <div className="flex justify-center mb-8">
            <div className="px-5 py-2 bg-white/10 border border-white/30 rounded-xl flex items-center justify-center backdrop-blur-md sm:bg-white sm:border-gray-100 shadow-sm">
              <span className="text-xl font-bold tracking-tighter text-white sm:text-[#b59a6d]">
                GTPEA
              </span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white sm:text-[#0a1629] mb-2 drop-shadow-md">
              Welcome
            </h2>
            <p className="text-sm text-gray-200 sm:text-gray-500 font-medium">
              Sign in to your enterprise account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/30 backdrop-blur-md text-white text-xs rounded-xl border border-red-500/40 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-gray-700 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 sm:text-gray-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="kay@tsg.com" 
                  required 
                  className="w-full pl-11 pr-4 py-4 bg-white/10 sm:bg-[#f8fafc] border border-white/20 sm:border-gray-200 rounded-2xl text-sm text-white sm:text-black placeholder-white/30 sm:placeholder-gray-400 focus:ring-2 focus:ring-white/30 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-gray-700 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 sm:text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-11 pr-11 py-4 bg-white/10 sm:bg-[#f8fafc] border border-white/20 sm:border-gray-200 rounded-2xl text-sm text-white sm:text-black focus:ring-2 focus:ring-white/30 outline-none" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 sm:text-gray-400">
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
                <a href="/forgot-password" size="sm" className="text-xs text-white/80 sm:text-blue-700 font-bold hover:underline">
                  Forgot password?
                </a>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-white text-black sm:bg-[#051128] sm:text-white font-black py-4 rounded-2xl shadow-xl text-sm mt-4 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/10 sm:border-gray-100 flex items-center justify-center gap-2">
            <LockKeyhole className="w-3 h-3 text-white/40 sm:text-gray-400" />
            <span className="text-[9px] text-white/40 sm:text-gray-400 font-bold uppercase tracking-[0.25em]">
              Encrypted Session
            </span>
          </div>
        </div>
      </div>
    </main>
  );
        }
