"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Smartphone, Shield, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Your session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    console.log("[change-password] User data:", {
      email: userData.user.email,
      userId: userData.user.id,
    });

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      console.error("[change-password] Auth update error:", updateError);
      setError(updateError.message);
      setLoading(false);
      return;
    }

    console.log("[change-password] Auth password updated successfully");

    // Update employee record with phone number and mark first login as complete
    const updateData = { 
      phone_number: phoneNumber,
      is_first_login: false,
      password_changed_at: new Date().toISOString()
    };
    
    console.log("[change-password] Updating employee record:", {
      email: userData.user.email,
      updateData,
    });

    const { error: employeeError, count } = await (supabase
      .from("employees") as any)
      .update(updateData)
      .eq("email", userData.user.email)
      .select();

    if (employeeError) {
      console.error("[change-password] Employee update error:", employeeError);
      console.error("[change-password] Error details:", JSON.stringify(employeeError, null, 2));
      setError(employeeError.message);
      setLoading(false);
      return;
    }

    console.log("[change-password] Employee record updated successfully:", {
      count,
      affectedRows: count,
    });

    // Also update phone number in profiles table
    const { error: profileError } = await (supabase
      .from("profiles") as any)
      .update({ phone: phoneNumber })
      .eq("user_id", userData.user.id);

    if (profileError) {
      console.error("[change-password] Profile update error:", profileError);
      // Don't fail the whole process if profile update fails, just log it
    } else {
      console.log("[change-password] Profile phone number updated successfully");
    }

    // Send OTP and redirect to verification page
    try {
      const otpResponse = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          userId: userData.user.id,
        }),
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        setError(otpData.error || "Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to OTP verification page
      window.location.href = "/verify-otp";
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      setLoading(false);
    }
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
              Secure Your Account.<br />
              Complete Setup.
            </h1>
            <p style={{
              fontSize: "16px",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: "1.6",
              marginBottom: "48px",
            }}>
              Set your custom password and provide your phone number for secure OTP verification.
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
                  <Lock style={{ width: "20px", height: "20px", color: "#C9A44C" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#FFFFFF", margin: "0 0 4px 0" }}>
                    SECURE PASSWORD
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
                    Create a strong, unique password for your account
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
                  <Smartphone style={{ width: "20px", height: "20px", color: "#C9A44C" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#FFFFFF", margin: "0 0 4px 0" }}>
                    OTP VERIFICATION
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
                    Receive secure codes via SMS for login verification
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
                    ONE-TIME SETUP
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
                    Complete this setup once for secure future logins
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
        width: isDesktop ? "440px" : "100%",
        zIndex: 2,
        padding: isDesktop ? "0" : "24px",
      }}>
        <div style={{ 
          background: isDesktop ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)",
          backdropFilter: isDesktop ? "blur(24px)" : "blur(20px)",
          WebkitBackdropFilter: isDesktop ? "blur(24px)" : "blur(20px)",
          border: isDesktop ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "20px",
          padding: isDesktop ? "24px" : "16px",
          boxShadow: isDesktop ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(201, 164, 76, 0.15)" : "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: isDesktop ? "24px" : "16px",
          }}>
            <div style={{
              width: isDesktop ? "56px" : "48px",
              height: isDesktop ? "56px" : "48px",
              backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              marginBottom: isDesktop ? "12px" : "8px",
            }}>
              <img
                src="/images/gtpea-logo.jpeg"
                alt="GTP Employees Association"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
              />
            </div>
            <h2 style={{
              fontSize: isDesktop ? "24px" : "20px",
              fontWeight: "700",
              color: isDesktop ? "#FFFFFF" : "#FFFFFF",
              margin: 0,
              textShadow: isDesktop ? "0 2px 4px rgba(0, 0, 0, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.5)",
            }}>
              Complete Your Setup
            </h2>
            <p style={{
              fontSize: isDesktop ? "14px" : "13px",
              color: isDesktop ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.9)",
              margin: "8px 0 0 0",
              textAlign: "center",
              textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.5)",
            }}>
              Set your password and phone number for secure access
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
              <label htmlFor="password" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.9)",
                marginBottom: "8px",
                textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.5)",
              }}>
                NEW PASSWORD
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
                  placeholder="Enter your new password"
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    height: isDesktop ? "52px" : "48px",
                    paddingLeft: isDesktop ? "46px" : "42px",
                    paddingRight: isDesktop ? "46px" : "42px",
                    border: isDesktop ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "8px",
                    color: isDesktop ? "#0F172A" : "#FFFFFF",
                    fontSize: isDesktop ? "15px" : "14px",
                    backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.25)",
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
                  {showPassword ? <EyeOff style={{ width: "20px", height: "20px" }} /> : <Eye style={{ width: "20px", height: "20px" }} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.9)",
                marginBottom: "8px",
                textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.5)",
              }}>
                CONFIRM PASSWORD
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
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    height: isDesktop ? "52px" : "48px",
                    paddingLeft: isDesktop ? "46px" : "42px",
                    paddingRight: isDesktop ? "46px" : "42px",
                    border: isDesktop ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "8px",
                    color: isDesktop ? "#0F172A" : "#FFFFFF",
                    fontSize: isDesktop ? "15px" : "14px",
                    backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.25)",
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
                  onClick={() => setShowConfirm(!showConfirm)}
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
                  {showConfirm ? <EyeOff style={{ width: "20px", height: "20px" }} /> : <Eye style={{ width: "20px", height: "20px" }} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="phone" style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.9)",
                marginBottom: "8px",
                textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.5)",
              }}>
                PHONE NUMBER
              </label>
              <div style={{ position: "relative" }}>
                <Smartphone style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  height: "20px",
                  color: "#64748B",
                }} />
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="024XXXXXXXX"
                  required
                  autoComplete="tel"
                  style={{
                    width: "100%",
                    height: isDesktop ? "52px" : "48px",
                    paddingLeft: isDesktop ? "46px" : "42px",
                    paddingRight: isDesktop ? "16px" : "14px",
                    border: isDesktop ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "8px",
                    color: isDesktop ? "#0F172A" : "#FFFFFF",
                    fontSize: isDesktop ? "15px" : "14px",
                    backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.25)",
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
              <p style={{
                fontSize: "12px",
                color: isDesktop ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.8)",
                margin: "6px 0 0 0",
                textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.5)",
              }}>
                Enter your mobile number for OTP verification
              </p>
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
              {loading ? "Processing..." : "Continue to OTP Verification"}
            </button>
          </form>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: isDesktop ? "20px" : "16px",
            padding: isDesktop ? "12px" : "10px",
            backgroundColor: isDesktop ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            border: isDesktop ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.3)",
          }}>
            <Shield style={{ width: "20px", height: "20px", color: isDesktop ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.9)" }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: "600", color: isDesktop ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.95)", margin: "0 0 2px 0", textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.5)" }}>
                Secure setup
              </p>
              <p style={{ fontSize: "12px", color: isDesktop ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.85)", margin: 0 }}>
                Your information is protected with encrypted communication.
              </p>
            </div>
          </div>

          <div style={{
            marginTop: isDesktop ? "20px" : "16px",
            paddingTop: isDesktop ? "16px" : "12px",
            textAlign: "center",
            borderTop: isDesktop ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 255, 255, 0.25)",
          }}>
            <p style={{ fontSize: "12px", color: isDesktop ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.8)", margin: 0, textShadow: isDesktop ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(0, 0, 0, 0.5)" }}>
              © {new Date().getFullYear()} Savings & Loan Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
