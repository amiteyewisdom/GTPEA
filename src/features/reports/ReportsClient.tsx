"use client";

import { Box, Grid, Paper, Typography, Button, Divider } from "@mui/material";
import {
  PeopleRounded, SavingsRounded, AccountBalanceRounded,
  MoneyOffRounded, AssessmentRounded, FileDownloadRounded,
} from "@mui/icons-material";
import { KPICard } from "@/components/ui/KPICard";
import { SavingsAreaChart } from "@/components/charts/SavingsAreaChart";
import { LoanBarChart } from "@/components/charts/LoanBarChart";
import { formatCurrency, formatPercent } from "@/utils/formatters";

const MOCK_SAVINGS_DATA = [
  { month: "Jul", savings: 142000000, contributions: 8400000 },
  { month: "Aug", savings: 156000000, contributions: 9100000 },
  { month: "Sep", savings: 168000000, contributions: 8700000 },
  { month: "Oct", savings: 182000000, contributions: 10200000 },
  { month: "Nov", savings: 198000000, contributions: 11400000 },
  { month: "Dec", savings: 215000000, contributions: 9800000 },
  { month: "Jan", savings: 228000000, contributions: 12100000 },
  { month: "Feb", savings: 241000000, contributions: 11600000 },
  { month: "Mar", savings: 256000000, contributions: 13400000 },
  { month: "Apr", savings: 269000000, contributions: 12900000 },
  { month: "May", savings: 284000000, contributions: 14200000 },
  { month: "Jun", savings: 298000000, contributions: 13600000 },
];

const MOCK_LOAN_DATA = [
  { month: "Jan", disbursed: 32000000, repaid: 18000000 },
  { month: "Feb", disbursed: 28000000, repaid: 22000000 },
  { month: "Mar", disbursed: 41000000, repaid: 19000000 },
  { month: "Apr", disbursed: 35000000, repaid: 24000000 },
  { month: "May", disbursed: 38000000, repaid: 27000000 },
  { month: "Jun", disbursed: 44000000, repaid: 31000000 },
];

interface ReportSummary {
  totalEmployees: number;
  activeLoans: number;
  totalApprovals: number;
  totalSavings: number;
  totalOutstanding: number;
  totalDisbursed: number;
  defaultRate: number;
}

export function ReportsClient({ summary }: { summary: ReportSummary }) {
  const reports = [
    { label: "Savings Summary Report", desc: "Monthly savings contributions, balances and interest earned" },
    { label: "Loan Disbursement Report", desc: "All disbursements with amounts, dates and borrower details" },
    { label: "Repayment Schedule Report", desc: "Upcoming and overdue repayments by employee" },
    { label: "Employee Status Report", desc: "Current employee roster with department breakdown" },
    { label: "Default & Risk Report", desc: "Defaulted loans, risk scores and recovery status" },
    { label: "Approval Audit Report", desc: "Full approval history with reviewer and timeline" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard title="Total Employees" value={summary.totalEmployees} icon={PeopleRounded} accent="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard title="Total Savings Pool" value={formatCurrency(summary.totalSavings)} icon={SavingsRounded} accent="success" trend="up" trendValue="+8.3%" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard title="Active Loans" value={summary.activeLoans} icon={AccountBalanceRounded} accent="accent" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard title="Total Disbursed" value={formatCurrency(summary.totalDisbursed)} icon={AccountBalanceRounded} accent="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard title="Outstanding Balance" value={formatCurrency(summary.totalOutstanding)} icon={MoneyOffRounded} accent="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard title="Default Rate" value={`${formatPercent(summary.defaultRate)}`} icon={AssessmentRounded} accent={summary.defaultRate > 5 ? "danger" : "primary"} />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "0.9375rem", mb: 0.5 }}>
              Savings Trend (12 months)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Total savings pool vs monthly contributions
            </Typography>
            <SavingsAreaChart data={MOCK_SAVINGS_DATA} />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "0.9375rem", mb: 0.5 }}>
              Loan Activity (6 months)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              Disbursements vs repayments
            </Typography>
            <LoanBarChart data={MOCK_LOAN_DATA} />
          </Paper>
        </Grid>
      </Grid>

      {/* Report exports */}
      <Paper sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "0.9375rem" }}>
              Generate Reports
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Export detailed reports in CSV or PDF format
            </Typography>
          </Box>
          <AssessmentRounded sx={{ color: "text.secondary", fontSize: 20 }} />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={1.5}>
          {reports.map(({ label, desc }) => (
            <Grid item xs={12} sm={6} lg={4} key={label}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "rgba(99,102,241,0.3)" },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.25 }}>
                    {desc}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FileDownloadRounded sx={{ fontSize: 14 }} />}
                    sx={{ fontSize: "0.75rem", py: 0.5 }}
                  >
                    CSV
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FileDownloadRounded sx={{ fontSize: 14 }} />}
                    sx={{ fontSize: "0.75rem", py: 0.5 }}
                  >
                    PDF
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
