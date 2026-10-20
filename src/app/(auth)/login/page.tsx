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

  // Scale desktop sizing with the viewport so shorter/narrower screens (laptops,
  // Windows display scaling) keep the same composition without overlap.
  const fit = (min: number, vh: number, max: number, vw?: number) =>
    `clamp(${min}px, ${vw ? `min(${vh}vh, ${vw}vw)` : `${vh}vh`}, ${max}px)`;

  const card = (
        <div style={{
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: "20px",
          padding: isDesktop ? fit(18, 3.4, 32) : "16px",
          boxShadow: "0 12px 40px rgba(22, 101, 52, 0.15)",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: isDesktop ? fit(12, 2.5, 24) : "16px",
          }}>
            {isDesktop && (
              <img
                src="/images/gtpea-logo.png"
                alt="GTPEA"
                style={{
                  width: fit(56, 11.5, 112),
                  height: fit(56, 11.5, 112),
                  objectFit: "contain",
                  marginBottom: fit(6, 1.2, 12),
                }}
              />
            )}
            <h2 style={{
              fontSize: isDesktop ? fit(20, 2.6, 24) : "20px",
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

          <form style={{ display: "flex", flexDirection: "column", gap: isDesktop ? fit(10, 1.7, 16) : "12px" }} onSubmit={handleSubmit}>
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
                    height: isDesktop ? fit(42, 5.5, 52) : "48px",
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
                    height: isDesktop ? fit(42, 5.5, 52) : "48px",
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
                height: isDesktop ? fit(42, 5.5, 52) : "48px",
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
            marginTop: isDesktop ? fit(10, 1.7, 16) : "12px",
            padding: isDesktop ? fit(8, 1.3, 12) : "10px",
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
            marginTop: isDesktop ? fit(10, 2.1, 20) : "16px",
            paddingTop: isDesktop ? fit(8, 1.7, 16) : "12px",
            textAlign: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.5)",
          }}>
            <p style={{ fontSize: "12px", color: "#374151", fontWeight: 600, margin: 0 }}>
              © {new Date().getFullYear()} GTP Employees Association
            </p>
          </div>
        </div>
  );

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      position: "relative",
      overflowX: "hidden",
      overflowY: "auto",
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

      {isDesktop ? (
        <div style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: "clamp(24px, 4vw, 72px)",
          padding: `${fit(16, 2.6, 24)} 7% ${fit(16, 2.6, 24)} clamp(24px, 2.5vw, 40px)`,
        }}>
          <div style={{
            flex: 1,
            minWidth: 0,
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header lockup — logo + association name */}
            <div style={{ display: "flex", alignItems: "center", gap: fit(12, 2.5, 24) }}>
              <img
                src="/images/gtpea-logo.png"
                alt="GTPEA"
                style={{ width: fit(90, 20, 190, 12), height: fit(90, 20, 190, 12), objectFit: "contain", flexShrink: 0 }}
              />
              <div style={{ borderLeft: "4px solid #166534", paddingLeft: fit(12, 2.5, 24) }}>
                <p style={{
                  fontSize: fit(22, 4.25, 40, 2.6),
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
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: `${fit(16, 4, 40)} 0 0 8px`,
            }}>
              <div style={{ maxWidth: "680px" }}>
                <h1 style={{
                  fontSize: fit(32, 6.2, 58, 3.8),
                  fontWeight: "800",
                  lineHeight: "1.1",
                  margin: `0 0 ${fit(8, 1.7, 16)} 0`,
                  color: "#14532D",
                }}>
                  Grow Your Savings.<br />
                  <span style={{ color: "#84CC16" }}>Build Your Future.</span>
                </h1>
                <p style={{
                  fontSize: fit(14, 1.9, 18),
                  color: "#4B5563",
                  lineHeight: "1.6",
                  margin: `0 0 ${fit(14, 3.4, 32)} 0`,
                  maxWidth: "460px",
                }}>
                  Securely manage your savings, loans and financial activities from one trusted platform.
                </p>

                <div style={{ display: "flex", gap: "clamp(12px, 1.5vw, 28px)" }}>
                  {[
                    { icon: Shield, label: "SECURE", desc: "Protected financial information" },
                    { icon: CheckCircle, label: "SIMPLE", desc: "Easy access to your records" },
                    { icon: Zap, label: "SMART", desc: "Transparent loan management" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      flex: "0 1 180px",
                      minWidth: 0,
                      background: "rgba(255, 255, 255, 0.72)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.85)",
                      borderRadius: "14px",
                      padding: `${fit(10, 1.5, 14)} clamp(10px, 1.1vw, 16px)`,
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
          </div>

          <div style={{ width: "clamp(340px, 30vw, 440px)", flexShrink: 0 }}>
            {card}
          </div>
        </div>
      ) : (
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
          zIndex: 2,
          padding: "16px 16px 32px",
        }}>
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
          {card}
        </div>
      )}
    </div>
  );
}
