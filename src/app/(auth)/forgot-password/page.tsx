"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { ArrowBackRounded, MarkEmailReadOutlined, EmailOutlined } from "@mui/icons-material";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError(error.message); } else { setSent(true); }
    setLoading(false);
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      height: 50, fontSize: "0.9375rem",
      backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.09)", borderRadius: "10px" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.16)" },
      "&.Mui-focused fieldset": { borderColor: "#6366F1", borderWidth: "1.5px" },
    },
  };

  return (
    <Box>
      <Box sx={{
        background: "rgba(14,17,23,0.85)", backdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px",
        p: { xs: 3, sm: "40px" },
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>

        {/* Back link */}
        <Box sx={{ mb: 3.5 }}>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.75,
              color: "#475569", fontSize: "0.8125rem", fontWeight: 600,
              transition: "color 0.15s ease",
              "&:hover": { color: "#94A3B8" },
            }}>
              <ArrowBackRounded sx={{ fontSize: 16 }} />
              Back to sign in
            </Box>
          </Link>
        </Box>

        {sent ? (
          /* ── Success state ── */
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: "50%", mx: "auto", mb: 3,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(16,185,129,0.15)",
            }}>
              <MarkEmailReadOutlined sx={{ fontSize: 32, color: "#10B981" }} />
            </Box>
            <Typography sx={{ fontSize: "1.375rem", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em", mb: 1 }}>
              Check your inbox
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.6, mb: 3 }}>
              We sent a recovery link to{" "}
              <Box component="span" sx={{ color: "#818CF8", fontWeight: 600 }}>{email}</Box>
              . It expires in 60 minutes.
            </Typography>
            <Box sx={{
              background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: "12px", p: 2, mb: 3, textAlign: "left",
            }}>
              {["Check your spam / junk folder", "The link expires in 60 minutes", "Each link can only be used once"].map((tip) => (
                <Box key={tip} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75, "&:last-child": { mb: 0 } }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#475569", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.8125rem", color: "#64748B" }}>{tip}</Typography>
                </Box>
              ))}
            </Box>
            <Button
              variant="outlined" fullWidth
              onClick={() => setSent(false)}
              sx={{
                height: 46, borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem",
                borderColor: "rgba(255,255,255,0.1)", color: "#94A3B8",
                "&:hover": { borderColor: "rgba(255,255,255,0.2)", bgcolor: "rgba(255,255,255,0.03)" },
              }}
            >
              Use a different email
            </Button>
          </Box>
        ) : (
          /* ── Request form ── */
          <>
            <Box sx={{ mb: 3.5 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: "12px", mb: 2.5,
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <EmailOutlined sx={{ fontSize: 22, color: "#818CF8" }} />
              </Box>
              <Typography sx={{ fontSize: "1.625rem", fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em", mb: 0.75 }}>
                Forgot your password?
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.5 }}>
                No problem. Enter your work email and we&apos;ll send a secure reset link.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px", fontSize: "0.8375rem" }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleReset} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Work Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required fullWidth autoFocus
                sx={inputSx}
              />
              <Button
                type="submit" variant="contained" fullWidth size="large"
                disabled={loading}
                sx={{
                  height: 50, mt: 0.5, borderRadius: "10px",
                  fontSize: "0.9375rem", fontWeight: 700,
                  background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                  transition: "all 0.2s ease",
                  "&:hover": { boxShadow: "0 6px 28px rgba(99,102,241,0.5)", transform: "translateY(-1px)" },
                  "&:active": { transform: "translateY(0)" },
                  "&.Mui-disabled": { background: "rgba(99,102,241,0.3)", boxShadow: "none" },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Send Recovery Link"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
