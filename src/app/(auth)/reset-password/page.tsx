"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle } from "@mui/icons-material";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    }
    setLoading(false);
  };

  const inputSx = { "& .MuiOutlinedInput-root": { height: 48 } };

  return (
    <Box
      sx={{
        background: "rgba(14,17,23,0.9)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        p: { xs: 3, sm: 4 },
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}
    >
      {done ? (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <CheckCircle sx={{ fontSize: 48, color: "#10B981", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Password updated!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting you to login…
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Set New Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose a strong password for your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="New Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              sx={inputSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(!showPw)} size="small">
                      {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              fullWidth
              sx={inputSx}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ height: 48, fontWeight: 700, mt: 0.5 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Update Password"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
