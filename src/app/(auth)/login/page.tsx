"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, Shield, CheckCircle, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
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

    try {
      const userAgent = navigator.userAgent;
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      await fetch('/api/sessions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_agent: userAgent,
          ip_address: ipAddress,
        }),
      });
    } catch (err) {
      console.error("Failed to track session:", err);
    }

    window.location.href = "/dashboard";
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "relative",
      backgroundImage: "url('/images/credit-union-bg.jpeg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(22, 163, 74, 0.25)",
      }} />

      {isDesktop && (
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "50%",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "48px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "auto",
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}>
              <img
                src="/images/gtpea-logo.jpeg"
                alt="GTP Employees Association"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }}
              />
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#C9A44C", margin: 0, letterSpacing: "0.5px" }}>
                SAVINGS & LOAN
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
                GTP Employees Association
              </p>
            </div>
          </div>

          <div style={{ maxWidth: "480px" }}>
            <h1 style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#FFFFFF",
              lineHeight: "1.2",
              marginBottom: "16px",
            }}>
              Grow Your Savings.<br />
              Build Your Future.
            </h1>
            <p style={{
              fontSize: "16px",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: "1.6",
              marginBottom: "48px",
            }}>
              Securely manage your savings, loans and financial activities from one trusted platform.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(201, 164, 76, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Shield style={{ width: "20px", height: "20px", color: "#C9A44C" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#FFFFFF", margin: "0 0 4px 0" }}>
                    SECURE
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
                    Protected financial information
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(201, 164, 76, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <CheckCircle style={{ width: "20px", height: "20px", color: "#C9A44C" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#FFFFFF", margin: "0 0 4px 0" }}>
                    SIMPLE
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
                    Easy access to your financial records
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(201, 164, 76, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Zap style={{ width: "20px", height: "20px", color: "#C9A44C" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#FFFFFF", margin: "0 0 4px 0" }}>
                    SMART
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
                    Transparent savings and loan management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: isDesktop ? "absolute" : "relative",
        right: isDesktop ? "7%" : "auto",
        top: isDesktop ? "50%" : "auto",
        left: isDesktop ? "auto" : "0",
        transform: isDesktop ? "translateY(-50%)" : "none",
        width: isDesktop ? "400px" : "100%",
        zIndex: 2,
        padding: isDesktop ? "0" : "24px",
      }}>
        <div style={{ 
          background: isDesktop ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: isDesktop ? "blur(24px)" : "none",
          WebkitBackdropFilter: isDesktop ? "blur(24px)" : "none",
          border: isDesktop ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "20px",
          padding: "16px",
          boxShadow: isDesktop ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(201, 164, 76, 0.15)" : "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              marginBottom: "8px",
            }}>
              <img
                src="/images/gtpea-logo.jpeg"
                alt="GTP Employees Association"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
              />
            </div>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: isDesktop ? "#FFFFFF" : "#0F172A",
              margin: 0,
              textShadow: isDesktop ? "0 2px 4px rgba(0, 0, 0, 0.3)" : "none",
            }}>
              Welcome back
            </h2>
          </div>

          <form style={{ display: "flex", flexDirection: "column", gap: "12px" }} onSubmit={handleSubmit}>
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
              <label htmlFor="email" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "#0F172A",
                marginBottom: "8px",
                textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "none",
              }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  color: "#64748B",
                }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "14px",
                    border: isDesktop ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid #D9E1EA",
                    borderRadius: "8px",
                    color: isDesktop ? "#0F172A" : "#0F172A",
                    fontSize: "14px",
                    backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.9)" : "#FFFFFF",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#C9A44C";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201, 164, 76, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D9E1EA";
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
                color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "#0F172A",
                marginBottom: "8px",
                textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "none",
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
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "42px",
                    border: isDesktop ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid #D9E1EA",
                    borderRadius: "8px",
                    color: isDesktop ? "#0F172A" : "#0F172A",
                    fontSize: "14px",
                    backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.9)" : "#FFFFFF",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#C9A44C";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201, 164, 76, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D9E1EA";
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
              justifyContent: "space-between",
              fontSize: "14px",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "#0F172A", cursor: "pointer", textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "none" }}>
                <input
                  type="checkbox"
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#C9A44C",
                    cursor: "pointer",
                  }}
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                style={{
                  color: "#16A34A",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#C9A44C"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#16A34A"}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "48px",
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                fontWeight: "600",
                fontSize: "15px",
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
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "12px",
            padding: "8px",
            backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.12)" : "#F7F8FA",
            borderRadius: "8px",
            border: isDesktop ? "1px solid rgba(255, 255, 255, 0.25)" : "none",
          }}>
            <Shield style={{ width: "20px", height: "20px", color: isDesktop ? "rgba(255, 255, 255, 0.8)" : "#64748B" }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: "600", color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "#0F172A", margin: "0 0 2px 0", textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "none" }}>
                Secure access
              </p>
              <p style={{ fontSize: "12px", color: isDesktop ? "rgba(255, 255, 255, 0.8)" : "#64748B", margin: 0 }}>
                Your information is protected with secure authentication and encrypted communication.
              </p>
            </div>
          </div>

          <div style={{
            marginTop: "12px",
            paddingTop: "10px",
            textAlign: "center",
            borderTop: isDesktop ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)",
          }}>
            <p style={{ fontSize: "12px", color: isDesktop ? "rgba(255, 255, 255, 0.7)" : "#64748B", margin: 0, textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "none" }}>
              © {new Date().getFullYear()} Savings & Loan Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
