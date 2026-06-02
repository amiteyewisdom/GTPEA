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
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/growth-plant.jpeg" alt="BG" fill className="object-cover scale-110" priority />
        {/* Darker overlay on mobile to make the glass pop */}
        <div className="absolute inset-0 bg-black/50 sm:bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* GLASS CARD: Transparent on mobile, Solid on desktop */}
        <div className="bg-white/10 backdrop-blur-[16px] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[2.5rem] p-8 sm:p-12 sm:bg-white sm:backdrop-blur-none sm:border-transparent sm:shadow-2xl">
          
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-white sm:text-[#b59a6d] sm:bg-white sm:border-gray-100 shadow-sm font-bold text-2xl backdrop-blur-md">
              C
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white sm:text-[#0a1629] mb-1">Welcome back</h2>
            <p className="text-sm text-gray-200 sm:text-gray-500">
              Sign in to your secure dashboard
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/20 backdrop-blur-md text-red-200 text-xs rounded-xl border border-red-500/30">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 sm:text-gray-700 mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 sm:text-gray-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="kay@tsg.com" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 sm:bg-[#f8fafc] border border-white/20 sm:border-gray-200 rounded-xl text-sm text-white sm:text-black placeholder-white/40 sm:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 sm:text-gray-700 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 sm:text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-11 pr-11 py-3.5 bg-white/10 sm:bg-[#f8fafc] border border-white/20 sm:border-gray-200 rounded-xl text-sm text-white sm:text-black focus:ring-2 focus:ring-blue-500/30 outline-none" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 sm:text-gray-400">
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[13px] pt-1">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/10" />
                  <span className="text-gray-200 sm:text-gray-600 font-medium">Keep signed in</span>
                </label>
                <a href="/forgot-password" size="sm" className="text-blue-300 sm:text-blue-700 font-bold hover:underline">Forgot?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#051128] hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg text-sm mt-4 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 sm:border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <LockKeyhole className="w-3 h-3" /> Secure Access
          </div>
        </div>
      </div>
    </main>
  );
          }
