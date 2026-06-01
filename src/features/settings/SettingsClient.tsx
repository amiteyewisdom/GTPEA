"use client";

import {
  Box, Paper, Typography, Divider, Switch, FormControlLabel,
  TextField, Button, Grid, Alert, Select, MenuItem, InputLabel,
  FormControl,
} from "@mui/material";
import { SaveRounded } from "@mui/icons-material";
import { useState } from "react";

export function SettingsClient() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [repaymentReminders, setRepaymentReminders] = useState(true);
  const [currency, setCurrency] = useState("GHS");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    {
      title: "Platform Configuration",
      subtitle: "Core settings for the GTPEA Finance platform",
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField label="Organisation Name" defaultValue="GTPEA" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Currency</InputLabel>
              <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value)}>
                <MenuItem value="GHS">GHS — Ghanaian Cedi (₵)</MenuItem>
                <MenuItem value="NGN">NGN — Nigerian Naira (₦)</MenuItem>
                <MenuItem value="USD">USD — US Dollar ($)</MenuItem>
                <MenuItem value="GBP">GBP — British Pound (£)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Default Interest Rate (%)" defaultValue="18" type="number" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Max Loan-to-Salary Ratio" defaultValue="3" type="number" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Minimum Savings Balance (₵)" defaultValue="5000" type="number" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Loan Approval Threshold (₵)" defaultValue="500000" type="number" fullWidth helperText="Loans above this require chairperson approval" />
          </Grid>
        </Grid>
      ),
    },
    {
      title: "Notifications",
      subtitle: "Configure system alerts and email notifications",
      content: (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { label: "Email notifications for new applications", value: emailNotifications, onChange: setEmailNotifications },
            { label: "Pending approval alerts", value: approvalAlerts, onChange: setApprovalAlerts },
            { label: "Loan repayment reminders", value: repaymentReminders, onChange: setRepaymentReminders },
          ].map(({ label, value, onChange }) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.25,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Typography sx={{ fontSize: "0.9375rem", color: "text.primary" }}>{label}</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366F1" },
                    }}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          ))}
        </Box>
      ),
    },
    {
      title: "Data & Compliance",
      subtitle: "Audit log settings and data retention policies",
      content: (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField label="Audit Log Retention (days)" defaultValue="365" type="number" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Session Timeout (minutes)" defaultValue="60" type="number" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Support Email"
              defaultValue="admin@gtpea.org"
              type="email"
              fullWidth
            />
          </Grid>
        </Grid>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)}>
          Settings saved successfully.
        </Alert>
      )}

      {sections.map(({ title, subtitle, content }) => (
        <Paper key={title} sx={{ p: 3 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "0.9375rem" }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2.5 }} />
          {content}
        </Paper>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<SaveRounded />}
          onClick={handleSave}
          sx={{ px: 3 }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
}
