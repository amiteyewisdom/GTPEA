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
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 font-sans antialiased">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/growth-plant.jpeg" 
          alt="BG" 
          fill 
          className="object-cover" 
          priority 
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* THE CARD - Forced transparency with inline style */}
        <div 
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          className="border border-white/20 shadow-2xl rounded-[2.5rem] p-8 sm:p-12 sm:bg-white sm:backdrop-blur-none"
        >
          
          {/* LOGO: HARDCODED TO GTPEA */}
          <div className="flex justify-center mb-8">
            <div className="px-6 py-2 bg-white/10 border border-white/20 rounded-xl">
              <span className="text-xl font-black tracking-widest text-white">
                GTPEA
              </span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-1">Welcome</h2>
            <p className="text-sm text-white/60">Enterprise Finance Login</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/20 text-white text-xs rounded-xl border border-red-500/30 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="kay@tsg.com" 
                  required 
                  className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm text-white outline-none focus:ring-1 focus:ring-white/40" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/70 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-11 pr-11 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm text-white outline-none" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl text-sm mt-4 hover:bg-gray-100 active:scale-95 transition-all"
            >
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
            <LockKeyhole className="w-3 h-3 text-white/30" />
            <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Secure Portal</span>
          </div>
        </div>
      </div>
    </main>
  );
          }
