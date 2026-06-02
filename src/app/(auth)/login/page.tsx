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
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Unable to sign in. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans antialiased">
      {/* Background Image - Matches the growth/coin theme */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/growth-plant.jpeg"
          alt="Growth"
          fill
          className="object-cover"
          priority
          style={{ objectFit: 'cover' }}
        />
        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Brand Info */}
        <div className="hidden lg:flex flex-col text-white max-w-md">
          <div className="flex items-center gap-3 mb-6">
            {/* Custom Logo Icon matching the "C" shape */}
            <div className="w-11 h-11 border-[3px] border-[#b59a6d] rounded-full flex items-center justify-center text-[#b59a6d] font-serif font-bold text-2xl">
              C
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              GTPEA <span className="text-[#b59a6d]">Finance</span>
            </h1>
          </div>

          <p className="text-lg font-medium opacity-90 leading-tight mb-6">
            Enterprise financial operations <br /> and lending platform
          </p>

          <div className="h-[1.5px] w-10 bg-[#b59a6d] mb-12" />

          <div className="flex items-start gap-3">
            <ShieldCheck className="text-[#b59a6d] w-6 h-6 mt-0.5" />
            <p className="text-[15px] font-medium leading-snug opacity-90">
              Secure access with enterprise <br /> grade encryption
            </p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-[480px]">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
            {/* Card Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#b59a6d] shadow-sm">
                <span className="text-3xl font-serif font-bold">C</span>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold text-[#0a1629] mb-3">Welcome back</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed px-4">
                Sign in to access your enterprise finance dashboard securely.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2 ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 stroke-[1.5]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kay@tsg.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-300 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 stroke-[1.5]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-300 transition-all text-sm tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye className="w-5 h-5 stroke-[1.5]" /> : <EyeOff className="w-5 h-5 stroke-[1.5]" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[14px] pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-gray-300 text-[#0a1629] focus:ring-[#0a1629]"
                  />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-[#3b60a3] font-semibold hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#051128] hover:bg-black text-white font-bold py-4.5 rounded-xl transition-all shadow-lg text-base mt-2 disabled:cursor-not-allowed disabled:opacity-70"
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
