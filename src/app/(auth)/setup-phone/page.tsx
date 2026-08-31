"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Smartphone } from "@mui/icons-material";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function SetupPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    // Update employee record with phone number
    const { error: employeeError } = await (supabase
      .from("employees") as any)
      .update({ 
        phone_number: phoneNumber,
      })
      .eq("email", userData.user.email);

    if (employeeError) {
      setError(employeeError.message);
      setLoading(false);
      return;
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

  const inputSx = { "& .MuiOutlinedInput-root": { height: 48 } };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(14,17,23,0.9)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Smartphone sx={{ fontSize: 28, color: "#818CF8" }} />
          <Typography variant="h5" fontWeight={700}>
            Set Up Phone Number
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your phone number for OTP verification before continuing.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            fullWidth
            autoFocus
            placeholder="024XXXXXXXX"
            sx={inputSx}
            helperText="Enter your mobile number for OTP verification"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ height: 48, fontWeight: 700, mt: 0.5 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Continue"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
