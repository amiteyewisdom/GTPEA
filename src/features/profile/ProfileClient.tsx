"use client";

import { useState } from "react";
import {
  Box, Paper, Typography, Avatar, Button, TextField, Grid,
  Divider, Alert, CircularProgress, Chip,
} from "@mui/material";
import { EditRounded, SaveRounded, CancelRounded, LockResetRounded } from "@mui/icons-material";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileData {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
}

interface ProfileClientProps {
  profile: ProfileData | null;
  email: string;
}

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient() as any;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", profile!.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setEditing(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const roleColors: Record<string, { color: string; bg: string; border: string }> = {
    super_admin:   { color: "#818CF8", bg: "rgba(99,102,241,0.1)",   border: "rgba(99,102,241,0.25)"   },
    administrator: { color: "#818CF8", bg: "rgba(99,102,241,0.1)",   border: "rgba(99,102,241,0.25)"   },
    fund_manager:  { color: "#22D3EE", bg: "rgba(6,182,212,0.1)",    border: "rgba(6,182,212,0.25)"    },
    chairperson:   { color: "#FCD34D", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)"   },
    union_rep:     { color: "#34D399", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.25)"   },
    employee:      { color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)"   },
  };
  const displayRole = profile?.role === "super_admin" ? "administrator" : (profile?.role ?? "employee");
  const roleStyle = roleColors[displayRole] ?? roleColors.employee;

  return (
    <Box sx={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Profile updated successfully.
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Profile header card */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          <Avatar
            src={profile?.avatar_url ?? undefined}
            sx={{
              width: 72, height: 72,
              fontSize: "1.5rem", fontWeight: 700,
              bgcolor: "rgba(99,102,241,0.15)",
              color: "#818CF8",
              border: "2px solid rgba(99,102,241,0.3)",
            }}
          >
            {fullName?.[0]?.toUpperCase() ?? "U"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>{fullName || "—"}</Typography>
            <Typography variant="body2" color="text.secondary">{email}</Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={displayRole.replace("_", " ")}
                size="small"
                sx={{
                  height: 22, fontSize: "0.6875rem", fontWeight: 600,
                  textTransform: "capitalize",
                  color: roleStyle.color,
                  bgcolor: roleStyle.bg,
                  border: `1px solid ${roleStyle.border}`,
                  borderRadius: 1,
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            </Box>
          </Box>
          <Button
            variant={editing ? "outlined" : "contained"}
            size="small"
            startIcon={editing ? <CancelRounded /> : <EditRounded />}
            onClick={() => {
              if (editing) {
                setFullName(profile?.full_name ?? "");
                setPhone(profile?.phone ?? "");
              }
              setEditing(!editing);
            }}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        </Box>
      </Paper>

      {/* Details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "0.9375rem", mb: 2 }}>
          Account Details
        </Typography>
        <Divider sx={{ mb: 2.5 }} />

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!editing}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email Address"
              value={email}
              disabled
              fullWidth
              helperText="Email cannot be changed here"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              fullWidth
              placeholder="+234 000 000 0000"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee ID"
              value={profile?.employee_id ?? "—"}
              disabled
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Role"
              value={profile?.role?.replace("_", " ") ?? "—"}
              disabled
              fullWidth
              inputProps={{ style: { textTransform: "capitalize" } }}
            />
          </Grid>
        </Grid>

        {editing && (
          <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SaveRounded />}
              onClick={handleSave}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Paper>

      {/* Security */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "0.9375rem", mb: 2 }}>
          Security
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600 }}>Password</Typography>
            <Typography variant="body2" color="text.secondary">
              Last changed: unknown. It&apos;s a good practice to update it periodically.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LockResetRounded />}
            onClick={handlePasswordReset}
          >
            Reset Password
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
