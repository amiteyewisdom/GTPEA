"use client";

import {
  Box, Paper, Typography, Divider, Switch, FormControlLabel,
  TextField, Button, Grid, Alert, Select, MenuItem, InputLabel,
  FormControl,
} from "@mui/material";
import { SaveRounded } from "@mui/icons-material";
import { useState } from "react";
import type { UserRole } from "@/types/index";

export function SettingsClient({ role }: { role: UserRole }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [repaymentReminders, setRepaymentReminders] = useState(true);
  const [currency, setCurrency] = useState("GHS");
  const [saved, setSaved] = useState(false);
  const [defaultInterest, setDefaultInterest] = useState(18);
  const [loanThreshold, setLoanThreshold] = useState(500000);
  const [auditRetention, setAuditRetention] = useState(365);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [supportEmail, setSupportEmail] = useState("admin@gtpea.org");
  const [reviewDigest, setReviewDigest] = useState(true);
  const [memberSupportAlerts, setMemberSupportAlerts] = useState(true);
  const [quickApprovalMode, setQuickApprovalMode] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // --- BRANDING STYLES (MATCHING LOGIN) ---
  const glassPanelSx = {
    p: 4,
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(212, 175, 55, 0.15)", // Gold muted border
    borderRadius: "20px",
    mb: 3,
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#FFFFFF",
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
      "&:hover fieldset": { borderColor: "#D4AF37" },
      "&.Mui-focused fieldset": { borderColor: "#D4AF37" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
    "& .MuiFormHelperText-root": { color: "rgba(255, 255, 255, 0.5)" },
  };

  const switchSx = {
    "& .MuiSwitch-switchBase.Mui-checked": { color: "#D4AF37" },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#D4AF37" },
  };

  // --- SHARED SECTIONS ---
  const platformSection = (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField label="Organisation Name" defaultValue="GTPEA" fullWidth sx={inputSx} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small" sx={inputSx}>
          <InputLabel>Currency</InputLabel>
          <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value)}>
            <MenuItem value="GHS">GHS — Ghanaian Cedi (₵)</MenuItem>
            <MenuItem value="NGN">NGN — Nigerian Naira (₦)</MenuItem>
            <MenuItem value="USD">USD — US Dollar ($)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Default Interest Rate (%)" value={defaultInterest} type="number" fullWidth sx={inputSx} onChange={(e) => setDefaultInterest(Number(e.target.value))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Loan Approval Threshold (₵)" value={loanThreshold} type="number" fullWidth sx={inputSx} helperText="Loans above this require chairperson approval" onChange={(e) => setLoanThreshold(Number(e.target.value))} />
      </Grid>
    </Grid>
  );

  const notificationSection = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {[
        { label: "Email notifications for new applications", value: emailNotifications, onChange: setEmailNotifications },
        { label: "Pending approval alerts", value: approvalAlerts, onChange: setApprovalAlerts },
        { label: "Loan repayment reminders", value: repaymentReminders, onChange: setRepaymentReminders },
      ].map(({ label, value, onChange }) => (
        <Box key={label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Typography sx={{ fontSize: "0.9375rem", color: "#FFFFFF" }}>{label}</Typography>
          <Switch checked={value} onChange={(e) => onChange(e.target.checked)} size="small" sx={switchSx} />
        </Box>
      ))}
    </Box>
  );

  const complianceSection = (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField label="Audit Log Retention (days)" value={auditRetention} type="number" fullWidth sx={inputSx} onChange={(e) => setAuditRetention(Number(e.target.value))} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Session Timeout (minutes)" value={sessionTimeout} type="number" fullWidth sx={inputSx} onChange={(e) => setSessionTimeout(Number(e.target.value))} />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Support Email" value={supportEmail} type="email" fullWidth sx={inputSx} onChange={(e) => setSupportEmail(e.target.value)} />
      </Grid>
    </Grid>
  );

  // --- RBAC LOGIC ---
  const roleSpecificSections =
    role === "super_admin" || role === "administrator" || role === "admin"
      ? [
          { title: "Platform Configuration", subtitle: "Core controls for GTPEA platform operations.", content: platformSection },
          { title: "Notifications", subtitle: "System alerts and approval notifications.", content: notificationSection },
          { title: "Data & Compliance", subtitle: "Audit settings, security, and retention policies.", content: complianceSection },
        ]
      : role === "fund_manager"
      ? [
          { title: "Fund Management", subtitle: "Manage fund thresholds and approval cadence.", content: platformSection },
          { 
            title: "Approval Workflow", 
            subtitle: "Set review rules for fund and board approvals.", 
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "#FFFFFF" }}>Quick approval mode</Typography>
                  <Switch checked={quickApprovalMode} onChange={(e) => setQuickApprovalMode(e.target.checked)} size="small" sx={switchSx} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "#FFFFFF" }}>Review digest emails</Typography>
                  <Switch checked={reviewDigest} onChange={(e) => setReviewDigest(e.target.checked)} size="small" sx={switchSx} />
                </Box>
              </Box>
            )
          },
        ]
      : role === "union_rep"
      ? [
          { 
            title: "Member Support Preferences", 
            subtitle: "Tailor notifications for member requests.", 
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "#FFFFFF" }}>Support alert emails</Typography>
                  <Switch checked={memberSupportAlerts} onChange={(e) => setMemberSupportAlerts(e.target.checked)} size="small" sx={switchSx} />
                </Box>
              </Box>
            )
          },
        ]
      : [
          { title: "Personal Preferences", subtitle: "Manage your account notifications and alerts.", content: notificationSection },
        ];

  return (
    <Box sx={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 3, py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>
          Settings
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
          Manage your platform preferences and security defaults.
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ bgcolor: "rgba(52, 209, 111, 0.2)", color: "#34D16F", border: "1px solid #34D16F", borderRadius: "12px" }}>
          System settings updated successfully.
        </Alert>
      )}

      {roleSpecificSections.map(({ title, subtitle, content }) => (
        <Paper key={title} sx={glassPanelSx} elevation={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#D4AF37", fontSize: "1.1rem" }}>
              {title}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
              {subtitle}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3, borderColor: "rgba(212, 175, 55, 0.15)" }} />
          {content}
        </Paper>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveRounded />}
          onClick={handleSave}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: "12px",
            bgcolor: "#2D7A4D", // Forest Green from login
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "#1e5a36", transform: "translateY(-1px)" },
            boxShadow: "0 4px 14px rgba(45, 122, 77, 0.4)",
            transition: "all 0.2s ease"
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}
