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

  const platformSection = (
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
        <TextField
          label="Default Interest Rate (%)"
          value={defaultInterest}
          type="number"
          fullWidth
          onChange={(e) => setDefaultInterest(Number(e.target.value))}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Loan Approval Threshold (₵)"
          value={loanThreshold}
          type="number"
          fullWidth
          helperText="Loans above this require chairperson approval"
          onChange={(e) => setLoanThreshold(Number(e.target.value))}
        />
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
  );

  const complianceSection = (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Audit Log Retention (days)"
          value={auditRetention}
          type="number"
          fullWidth
          onChange={(e) => setAuditRetention(Number(e.target.value))}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Session Timeout (minutes)"
          value={sessionTimeout}
          type="number"
          fullWidth
          onChange={(e) => setSessionTimeout(Number(e.target.value))}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Support Email"
          value={supportEmail}
          type="email"
          fullWidth
          onChange={(e) => setSupportEmail(e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const roleSpecificSections: Array<{ title: string; subtitle: string; content: JSX.Element }> =
    role === "super_admin" || role === "administrator" || role === "admin"
      ? [
          {
            title: "Platform Configuration",
            subtitle: "Core controls for GTPEA platform operations.",
            content: platformSection,
          },
          {
            title: "Notifications",
            subtitle: "System alerts and approval notifications.",
            content: notificationSection,
          },
          {
            title: "Data & Compliance",
            subtitle: "Audit settings, security, and retention policies.",
            content: complianceSection,
          },
        ]
      : role === "fund_manager"
      ? [
          {
            title: "Fund Management",
            subtitle: "Manage fund thresholds and approval cadence.",
            content: (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Loan Approval Threshold (₵)"
                    value={loanThreshold}
                    type="number"
                    fullWidth
                    helperText="Higher loans require executive sign-off"
                    onChange={(e) => setLoanThreshold(Number(e.target.value))}
                  />
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
              </Grid>
            ),
          },
          {
            title: "Approval Workflow",
            subtitle: "Set review rules for fund and board approvals.",
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "text.primary" }}>Quick approval mode</Typography>
                  <Switch
                    checked={quickApprovalMode}
                    onChange={(e) => setQuickApprovalMode(e.target.checked)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366F1" },
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "text.primary" }}>Review digest emails</Typography>
                  <Switch
                    checked={reviewDigest}
                    onChange={(e) => setReviewDigest(e.target.checked)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366F1" },
                    }}
                  />
                </Box>
              </Box>
            ),
          },
          {
            title: "Notifications",
            subtitle: "Stay updated on approvals and loan activity.",
            content: notificationSection,
          },
        ]
      : role === "union_rep"
      ? [
          {
            title: "Member Support Preferences",
            subtitle: "Tailor notifications for member requests and approvals.",
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "text.primary" }}>Support alert emails</Typography>
                  <Switch
                    checked={memberSupportAlerts}
                    onChange={(e) => setMemberSupportAlerts(e.target.checked)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366F1" },
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "text.primary" }}>Review digest emails</Typography>
                  <Switch
                    checked={reviewDigest}
                    onChange={(e) => setReviewDigest(e.target.checked)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366F1" },
                    }}
                  />
                </Box>
              </Box>
            ),
          },
          {
            title: "Approval Alerts",
            subtitle: "Control how you receive loan review notifications.",
            content: notificationSection,
          },
        ]
      : role === "chairperson" || role === "chairman"
      ? [
          {
            title: "Board Approval Settings",
            subtitle: "Fine-tune final authorization and alert triggers.",
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "text.primary" }}>Approval alerts</Typography>
                  <Switch
                    checked={approvalAlerts}
                    onChange={(e) => setApprovalAlerts(e.target.checked)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366F1" },
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography sx={{ fontSize: "0.9375rem", color: "text.primary" }}>Summary digest</Typography>
                  <Switch
                    checked={reviewDigest}
                    onChange={(e) => setReviewDigest(e.target.checked)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#6366F1" },
                    }}
                  />
                </Box>
              </Box>
            ),
          },
          {
            title: "Data & Compliance",
            subtitle: "Board-level retention and security controls.",
            content: complianceSection,
          },
        ]
      : [
          {
            title: "Personal Preferences",
            subtitle: "Manage your account notifications and repayment alerts.",
            content: notificationSection,
          },
          {
            title: "Security & Support",
            subtitle: "Update support settings and security preferences.",
            content: (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Support Email" value={supportEmail} type="email" fullWidth onChange={(e) => setSupportEmail(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Session Timeout (minutes)" value={sessionTimeout} type="number" fullWidth onChange={(e) => setSessionTimeout(Number(e.target.value))} />
                </Grid>
              </Grid>
            ),
          },
        ];

  return (
    <Box sx={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)}>
          Settings saved successfully.
        </Alert>
      )}

      {roleSpecificSections.map(({ title, subtitle, content }) => (
        <Paper key={title} sx={{ p: 3, bgcolor: "rgba(15, 23, 42, 0.92)", border: "1px solid rgba(148, 163, 184, 0.16)" }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "0.9375rem", color: "#F8FAFC" }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              {subtitle}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2.5, borderColor: "rgba(148, 163, 184, 0.16)" }} />
          {content}
        </Paper>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<SaveRounded />}
          onClick={handleSave}
          sx={{ px: 3, bgcolor: "#38BDF8", color: "#020617", '&:hover': { bgcolor: "#22D3EE" } }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
}
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
