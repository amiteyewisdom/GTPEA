"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, Shield, CheckCircle, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // The page renders its own full-viewport canvas — prevent the document
  // itself from ever scrolling.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('[Login] Attempting login with:', { staffId, hasPassword: !!password });
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        setLoading(false);
        return;
      }

      // Handle different login flows
      if (data.isFirstLogin) {
        window.location.href = "/change-password";
      } else if (data.requiresPhoneSetup) {
        window.location.href = "/setup-phone";
      } else if (data.requiresOtp) {
        window.location.href = "/verify-otp";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      position: "relative",
      overflow: "hidden",
      backgroundImage: "url('/images/landing-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>

      {isDesktop && (
        <>
          {/* Header lockup — logo + association name */}
          <div style={{
            position: "absolute",
            top: "28px",
            left: "48px",
            right: "48px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            zIndex: 2,
          }}>
            <img
              src="/images/gtpea-logo.png"
              alt="GTPEA"
              style={{ width: "84px", height: "84px", objectFit: "contain" }}
            />
            <div style={{ borderLeft: "3px solid #16A34A", paddingLeft: "20px" }}>
              <p style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#166534",
                margin: 0,
                letterSpacing: "0.5px",
                lineHeight: 1.15,
              }}>
                GTP EMPLOYEES ASSOCIATION
              </p>
              <p style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#16A34A",
                margin: "2px 0 0 0",
                letterSpacing: "2px",
              }}>
                (GTPEA)
              </p>
            </div>
          </div>

          {/* Hero column */}
          <div style={{
            position: "absolute",
            left: "48px",
            top: 0,
            bottom: 0,
            width: "52%",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <div style={{ maxWidth: "560px", marginTop: "60px" }}>
              <h1 style={{
                fontSize: "58px",
                fontWeight: "800",
                lineHeight: "1.1",
                margin: "0 0 16px 0",
                color: "#14532D",
              }}>
                Grow Your Savings.<br />
                <span style={{ color: "#84CC16" }}>Build Your Future.</span>
              </h1>
              <p style={{
                fontSize: "18px",
                color: "#4B5563",
                lineHeight: "1.6",
                margin: "0 0 32px 0",
                maxWidth: "460px",
              }}>
                Securely manage your savings, loans and financial activities from one trusted platform.
              </p>

              <div style={{ display: "flex", gap: "28px" }}>
                {[
                  { icon: Shield, label: "SECURE", desc: "Protected financial information" },
                  { icon: CheckCircle, label: "SIMPLE", desc: "Easy access to your records" },
                  { icon: Zap, label: "SMART", desc: "Transparent loan management" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "160px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "#DCFCE7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Icon style={{ width: "22px", height: "22px", color: "#16A34A" }} />
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#166534", margin: 0, letterSpacing: "0.5px" }}>
                      {label}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: 1.4 }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      <div style={{
        position: isDesktop ? "absolute" : "relative",
        right: isDesktop ? "7%" : "auto",
        top: isDesktop ? "50%" : "auto",
        left: isDesktop ? "auto" : "0",
        transform: isDesktop ? "translateY(-50%)" : "none",
        width: isDesktop ? "440px" : "100%",
        maxWidth: isDesktop ? "none" : "400px",
        margin: isDesktop ? "0" : "0 auto",
        zIndex: 2,
        padding: isDesktop ? "0" : "16px",
      }}>
        {!isDesktop && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "20px 0 4px",
          }}>
            <img
              src="/images/gtpea-logo.png"
              alt="GTPEA"
              style={{ width: "72px", height: "72px", objectFit: "contain", marginBottom: "8px" }}
            />
            <p style={{ fontSize: "15px", fontWeight: "800", color: "#166534", margin: 0, letterSpacing: "0.5px" }}>
              GTP EMPLOYEES ASSOCIATION (GTPEA)
            </p>
            <h1 style={{ fontSize: "30px", fontWeight: "800", color: "#14532D", margin: "12px 0 4px", lineHeight: 1.15 }}>
              Grow Your Savings.<br />
              <span style={{ color: "#84CC16" }}>Build Your Future.</span>
            </h1>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 8px" }}>
              Securely manage your savings, loans and financial activities from one trusted platform.
            </p>
          </div>
        )}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          padding: isDesktop ? "32px" : "20px",
          boxShadow: "0 12px 40px rgba(22, 101, 52, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: isDesktop ? "24px" : "16px",
          }}>
            {isDesktop && (
              <img
                src="/images/gtpea-logo.png"
                alt="GTPEA"
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "contain",
                  marginBottom: "12px",
                }}
              />
            )}
            <h2 style={{
              fontSize: isDesktop ? "24px" : "20px",
              fontWeight: "700",
              color: "#14532D",
              margin: 0,
            }}>
              Welcome
            </h2>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
              Sign in to your member account
            </p>
          </div>

          <form style={{ display: "flex", flexDirection: "column", gap: isDesktop ? "16px" : "12px" }} onSubmit={handleSubmit}>
            {error && (
              <div style={{
                borderRadius: "8px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                padding: "14px 16px",
                fontSize: "14px",
                color: "#DC2626",
              }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="staffId" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}>
                STAFF ID
              </label>
              <div style={{ position: "relative" }}>
                <Shield style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  color: "#64748B",
                }} />
                <input
                  id="staffId"
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="Enter your Staff ID"
                  required
                  autoComplete="username"
                  style={{
                    width: "100%",
                    height: isDesktop ? "52px" : "48px",
                    paddingLeft: isDesktop ? "46px" : "42px",
                    paddingRight: isDesktop ? "16px" : "14px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    color: "#111827",
                    fontSize: isDesktop ? "15px" : "14px",
                    backgroundColor: "#F9FAFB",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#16A34A";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D1D5DB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  color: "#64748B",
                }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    height: isDesktop ? "52px" : "48px",
                    paddingLeft: isDesktop ? "46px" : "42px",
                    paddingRight: isDesktop ? "46px" : "42px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                    color: "#111827",
                    fontSize: isDesktop ? "15px" : "14px",
                    backgroundColor: "#F9FAFB",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#16A34A";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 163, 74, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D1D5DB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748B",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  {showPassword ? <Eye style={{ width: "20px", height: "20px" }} /> : <EyeOff style={{ width: "20px", height: "20px" }} />}
                </button>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isDesktop ? "space-between" : "flex-start",
              fontSize: "14px",
            }}>
              <span
                style={{
                  color: "#6B7280",
                  fontWeight: "500",
                  fontSize: "12px",
                }}
              >
                Forgot password? Contact your administrator
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: isDesktop ? "52px" : "48px",
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: isDesktop ? "16px" : "15px",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "background-color 0.2s",
                border: "none",
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#15803D")}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#16A34A"}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={{
            marginTop: isDesktop ? "16px" : "12px",
            padding: isDesktop ? "12px" : "10px",
            backgroundColor: "#F0FDF4",
            borderRadius: "8px",
            border: "1px solid #BBF7D0",
          }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#15803D", margin: "0 0 4px 0" }}>
              First-time login?
            </p>
            <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: "1.4" }}>
              Default password: <span style={{ fontWeight: "600", color: "#16A34A" }}>{process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD || "Gtpea@2026"}</span>
            </p>
            <p style={{ fontSize: "11px", color: "#6B7280", margin: "4px 0 0 0" }}>
              You will be prompted to change your password and set up phone verification after login.
            </p>
          </div>

          <div style={{
            marginTop: isDesktop ? "20px" : "16px",
            paddingTop: isDesktop ? "16px" : "12px",
            textAlign: "center",
            borderTop: "1px solid #E5E7EB",
          }}>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
              © {new Date().getFullYear()} GTP Employees Association
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
