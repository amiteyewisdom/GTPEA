"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    await supabase.auth.signOut();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Unable to sign in.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
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
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
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

        <form style={{ display: "flex", flexDirection: "column", gap: "16px" }} onSubmit={handleSubmit}>
          {error && (
            <div style={{
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              padding: "12px 16px",
              fontSize: "14px",
              color: "#b91c1c"
            }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Email Address
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
                autoComplete="email"
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

          <div>
            <label htmlFor="password" style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                height: "20px",
                width: "20px",
                color: "#9ca3af"
              }} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  paddingRight: "40px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  color: "#111827",
                  fontSize: "14px"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer"
                }}
              >
                {showPassword ? <Eye style={{ height: "20px", width: "20px" }} /> : <EyeOff style={{ height: "20px", width: "20px" }} />}
              </button>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px"
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" style={{ borderRadius: "4px" }} />
              Remember me
            </label>
            <a href="/forgot-password" style={{ color: "#16a34a", textDecoration: "none" }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#16a34a",
              color: "white",
              fontWeight: "500",
              padding: "12px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{
          marginTop: "24px",
          paddingTop: "24px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center"
        }}>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            © {new Date().getFullYear()} GTP Employees Association
          </p>
        </div>
      </div>
    </div>
  );
}
