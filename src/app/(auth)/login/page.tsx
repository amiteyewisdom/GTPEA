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
        <Image src="/images/growth-plant.jpeg" alt="BG" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40 sm:bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* The Card: white/70 + heavy blur on mobile | white/95 + standard blur on desktop */}
        <div className="bg-white/70 backdrop-blur-2xl sm:bg-white/95 sm:backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-white/20 sm:border-transparent">
          
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-white/80 sm:bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#b59a6d] shadow-sm font-bold text-2xl">
              C
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#0a1629] mb-1">Welcome</h2>
            <p className="text-sm text-gray-600 sm:text-gray-500 font-medium">
              Sign in to your finance dashboard
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50/80 backdrop-blur-md text-red-700 text-xs rounded-xl border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="kay@tsg.com" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 sm:bg-[#f8fafc] border border-gray-200/50 sm:border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-11 pr-11 py-3.5 bg-white/50 sm:bg-[#f8fafc] border border-gray-200/50 sm:border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[13px] pt-1">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-gray-700 sm:text-gray-600 font-medium">Remember</span>
                </label>
                <a href="/forgot-password" className="text-blue-700 font-bold hover:underline">Forgot?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#051128] hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg text-sm mt-4 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200/30 sm:border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-500 sm:text-gray-400 font-bold uppercase tracking-widest">
            <LockKeyhole className="w-3 h-3" /> Secure Enterprise Access
          </div>
        </div>
      </div>
    </main>
  );
      }
