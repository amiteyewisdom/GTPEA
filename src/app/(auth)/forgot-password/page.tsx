"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/images/credit-union-bg.jpeg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        backgroundColor: "rgba(6, 38, 23, 0.7)",
        position: "absolute",
        inset: 0
      }} />
      
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        padding: "32px",
        border: "1px solid rgba(255, 255, 255, 0.3)"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: "16px",
              cursor: "pointer"
            }}>
              <ArrowLeft style={{ height: "16px", width: "16px" }} />
              Back to sign in
            </div>
          </Link>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "64px",
              width: "64px",
              marginBottom: "16px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              <img
                src="/images/gtpea-logo.jpeg"
                alt="GTPEA"
                style={{ height: "100%", width: "100%", objectFit: "contain" }}
              />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#16a34a", marginBottom: "4px" }}>GTPEA</h1>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Employees Association</p>
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              margin: "0 auto 24px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <CheckCircle style={{ height: "32px", width: "32px", color: "#10B981" }} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6", marginBottom: "24px" }}>
              We sent a recovery link to <strong>{email}</strong>. It expires in 60 minutes.
            </p>
            <div style={{
              backgroundColor: "rgba(99, 102, 241, 0.06)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              textAlign: "left"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#475569" }} />
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Check your spam / junk folder</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#475569" }} />
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>The link expires in 60 minutes</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#475569" }} />
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Each link can only be used once</p>
              </div>
            </div>
            <button
              onClick={() => setSent(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                backgroundColor: "transparent",
                color: "#6b7280",
                fontWeight: 500,
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "24px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                marginBottom: "16px",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Mail style={{ height: "22px", width: "22px", color: "#818CF8" }} />
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
                Forgot your password?
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
                No problem. Enter your work email and we'll send a secure reset link.
              </p>
            </div>

            {error && (
              <div style={{
                borderRadius: "8px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "12px 16px",
                fontSize: "14px",
                color: "#b91c1c",
                marginBottom: "16px"
              }}>
                {error}
              </div>
            )}

            <form style={{ display: "flex", flexDirection: "column", gap: "16px" }} onSubmit={handleReset}>
              <div>
                <label htmlFor="email" style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Work Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "20px",
                    width: "20px",
                    color: "#9ca3af"
                  }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gtpea.com"
                    required
                    autoFocus
                    style={{
                      width: "100%",
                      paddingLeft: "40px",
                      paddingRight: "16px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      color: "#111827",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: "#6366F1",
                  color: "white",
                  fontWeight: 700,
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  fontSize: "15px"
                }}
              >
                {loading ? "Sending..." : "Send Recovery Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
