"use client";

import React, { useState } from "react";
import { Mail, Lock, EyeOff, Eye, User, Phone, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          employee_id: employeeId,
          role: "employee",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message || "Unable to create account.");
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
      return;
    }

    setCreated(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between bg-gradient-to-br from-brand-green-dark via-brand-green to-brand-green-light text-white p-12 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#b59a6d" strokeWidth="2.5" />
              <text x="16" y="21" textAnchor="middle" fill="#b59a6d" fontSize="14" fontWeight="bold" fontFamily="serif">₵</text>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">GTPEA Finance</h1>
            <p className="text-xs text-white/70">GTP Employees Association</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Join the GTPEA financial platform
          </h2>
          <p className="text-base text-white/80 mb-10 leading-relaxed">
            Create your account to manage savings, apply for loans, and track dividends.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Employee verification</h3>
                <p className="text-sm text-white/70">Use your employee number to link your account.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Secure access</h3>
                <p className="text-sm text-white/70">Protected by email confirmation and 2FA.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Member-only features</h3>
                <p className="text-sm text-white/70">Savings, loans, dividends, and statements.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} GTP Employees Association. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-brand-background">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-green-dark mb-4 shadow-md">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="#b59a6d" strokeWidth="2.5" />
                <text x="16" y="21" textAnchor="middle" fill="#b59a6d" fontSize="14" fontWeight="bold" fontFamily="serif">₵</text>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-text">GTPEA Finance</h1>
            <p className="text-sm text-brand-text-secondary mt-1">GTP Employees Association</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-brand-card-border p-8">
            {created ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 border border-green-100 mb-4">
                  <svg className="w-7 h-7 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account created</h2>
                <p className="text-sm text-brand-text-secondary mb-6">
                  Check your email to confirm your account, then sign in.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Go to sign in
                </a>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create an account</h2>
                <p className="text-sm text-brand-text-secondary mb-8">Enter your details to get started.</p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gtpea.com"
                        required
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0244 000 000"
                          className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee number</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          placeholder="GTP-1234"
                          required
                          className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full pl-11 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-brand-green font-medium hover:underline">
                      Sign in
                    </a>
                  </p>
                </form>
              </>
            )}
          </div>

          <p className="hidden lg:block text-center text-xs text-brand-text-secondary mt-6">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
