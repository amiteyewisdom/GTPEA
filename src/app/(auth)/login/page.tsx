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
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

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
      backgroundImage: isDesktop ? "url('/images/landing-bg.jpg')" : "url('/images/landing-bg-mobile.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center bottom",
      backgroundRepeat: "no-repeat",
    }}>

      {!isDesktop && (
        <>
          {/* decorative green accents for the plain top area */}
          <div style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(22, 163, 74, 0.25) 0%, rgba(22, 163, 74, 0.08) 50%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            top: "-40px",
            right: "-50px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201, 164, 76, 0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
        </>
      )}

      {isDesktop && (
        <>
          {/* Header lockup — logo + association name */}
          <div style={{
            position: "absolute",
            top: "24px",
            left: "40px",
            right: "48px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            zIndex: 2,
          }}>
            <img
              src="/images/gtpea-logo.png"
              alt="GTPEA"
              style={{ width: "190px", height: "190px", objectFit: "contain" }}
            />
            <div style={{ borderLeft: "4px solid #166534", paddingLeft: "24px" }}>
              <p style={{
                fontSize: "40px",
                fontWeight: "800",
                color: "#166534",
                margin: 0,
                letterSpacing: "0.5px",
                lineHeight: 1.1,
              }}>
                GTP EMPLOYEES<br />ASSOCIATION (GTPEA)
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
            <div style={{ maxWidth: "680px", marginTop: "120px" }}>
              <h1 style={{
                fontSize: "58px",
                fontWeight: "800",
                lineHeight: "1.1",
                margin: "0 0 16px 0",
                color: "#14532D",
                whiteSpace: "nowrap",
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
                  <div key={label} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    maxWidth: "180px",
                    background: "rgba(255, 255, 255, 0.72)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.85)",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    boxShadow: "0 4px 16px rgba(22, 101, 52, 0.10)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        backgroundColor: "#16A34A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon style={{ width: "18px", height: "18px", color: "#FFFFFF" }} />
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: "800", color: "#14532D", margin: 0, letterSpacing: "0.5px" }}>
                        {label}
                      </p>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.4 }}>
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
        padding: isDesktop ? "0" : "16px 16px 32px",
      }}>
        {!isDesktop && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "14px 0 12px",
            marginBottom: "14px",
          }}>
            <img
              src="/images/gtpea-logo.png"
              alt="GTPEA"
              style={{ width: "124px", height: "124px", objectFit: "contain", marginBottom: "10px", filter: "drop-shadow(0 4px 10px rgba(22, 101, 52, 0.25))" }}
            />
            <p style={{ fontSize: "18px", fontWeight: "800", color: "#166534", margin: 0, letterSpacing: "0.5px", lineHeight: 1.3 }}>
              GTP EMPLOYEES ASSOCIATION<br />(GTPEA)
            </p>
          </div>
        )}
        <div style={{
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: "20px",
          padding: isDesktop ? "32px" : "16px",
          boxShadow: "0 12px 40px rgba(22, 101, 52, 0.15)",
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
                  width: "112px",
                  height: "112px",
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
                    backgroundColor: "rgba(255, 255, 255, 0.75)",
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
                    backgroundColor: "rgba(255, 255, 255, 0.75)",
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
            borderTop: "1px solid rgba(255, 255, 255, 0.5)",
          }}>
            <p style={{ fontSize: "12px", color: "#374151", fontWeight: 600, margin: 0 }}>
              © {new Date().getFullYear()} GTP Employees Association
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
