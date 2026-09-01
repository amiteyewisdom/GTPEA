"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function VerifyOtpPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Get user info from session
    const initPage = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        setUserId(userData.user.id);
        
        if (!userData.user.email) {
          setError("User email not found. Please contact support.");
          return;
        }
        
        // Try to get phone number from employee record first
        const { data: employeeData } = await (supabase
          .from("employees") as any)
          .select("phone_number")
          .eq("email", userData.user.email)
          .maybeSingle();
        
        if (employeeData && employeeData.phone_number) {
          setPhoneNumber(employeeData.phone_number);
          // Don't auto-send code since it's already sent from login
          setInfo("Verification code sent to your phone.");
          return;
        }
        
        // If not an employee, get phone number from profiles
        const { data: profileData } = await (supabase
          .from("profiles") as any)
          .select("phone")
          .eq("user_id", userData.user.id)
          .maybeSingle();
        
        if (profileData && profileData.phone) {
          setPhoneNumber(profileData.phone);
          // Don't auto-send code since it's already sent from login
          setInfo("Verification code sent to your phone.");
        } else {
          setError("Phone number not found. Please contact support.");
        }
      } else {
        window.location.href = "/login";
      }
    };
    
    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendCode() {
    if (!phoneNumber || !userId) {
      setError("Missing required information. Please try logging in again.");
      return;
    }

    setResending(true);
    setError("");
    setInfo("");
    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not send verification code.");
      setInfo(data.message ?? "Verification code sent.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send verification code.");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Verification failed.");
      window.location.href = "/dashboard";
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f1] font-sans antialiased px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e5a36] mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-[#b59a6d]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e5a36]">Verify your identity</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code sent to your phone to continue.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                {error}
              </div>
            )}
            {info && !error && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
                {info}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                autoFocus
                className="w-full text-center tracking-[0.5em] text-lg font-semibold px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#1e5a36] focus:ring-2 focus:ring-[#1e5a36]/10 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#1e5a36] hover:bg-[#174d2f] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>

            <button
              type="button"
              onClick={sendCode}
              disabled={resending}
              className="w-full text-sm text-[#1e5a36] font-medium hover:underline disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} GTP Employees Association
        </p>
      </div>
    </main>
  );
}
