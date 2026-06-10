"use client";

import { Box, Grid, Paper, Typography, Button, Divider } from "@mui/material";
import {
  PeopleRounded, SavingsRounded, AccountBalanceRounded,
  MoneyOffRounded, AssessmentRounded, FileDownloadRounded,
  AccountBalanceWalletRounded, TrendingUpRounded,
} from "@mui/icons-material";
import { KPICard } from "@/components/ui/KPICard";
import { SavingsAreaChart } from "@/components/charts/SavingsAreaChart";
import { LoanBarChart } from "@/components/charts/LoanBarChart";
import { formatCurrency, formatPercent } from "@/utils/formatters";

interface ReportSummary {
  totalEmployees: number;
  activeLoans: number;
  totalApprovals: number;
  totalSavings: number;
  totalOutstanding: number;
  totalDisbursed: number;
  totalWithdrawals: number;
  totalDividends: number;
  defaultRate: number;
}

interface ChartData {
  month: string;
  savings: number;
  contributions: number;
  disbursed: number;
  repaid: number;
  withdrawals: number;
  dividends: number;
}

export function ReportsClient({ summary, savingsChartData = [], loanChartData = [] }: { 
  summary: ReportSummary;
  savingsChartData?: ChartData[];
  loanChartData?: ChartData[];
}) {
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
          <KPICard title="Total Withdrawals" value={formatCurrency(summary.totalWithdrawals)} icon={AccountBalanceWalletRounded} accent="accent" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <KPICard title="Total Dividends" value={formatCurrency(summary.totalDividends)} icon={TrendingUpRounded} accent="success" />
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
            <SavingsAreaChart data={savingsChartData.length > 0 ? savingsChartData : []} />
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
            <LoanBarChart data={loanChartData.length > 0 ? loanChartData : []} />
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
