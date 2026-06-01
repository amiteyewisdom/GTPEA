"use client";

import { Box, Grid, Typography, Paper, Divider } from "@mui/material";
import {
  PeopleRounded,
  SavingsRounded,
  AccountBalanceRounded,
  PendingActionsRounded,
  SwapHorizRounded,
} from "@mui/icons-material";
import { KPICard } from "@/components/ui/KPICard";
import { SavingsAreaChart } from "@/components/charts/SavingsAreaChart";
import { LoanBarChart } from "@/components/charts/LoanBarChart";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatCurrency, formatDate } from "@/utils/formatters";

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

import type { Transaction, TransactionType } from "@/types/database";

interface KPIs {
  totalEmployees: number;
  activeEmployees: number;
  totalSavings: number;
  totalOutstanding: number;
  activeLoans: number;
  pendingApprovals: number;
}

const TX_COLORS: Record<string, string> = {
  savings_deposit:    "#34D399",
  savings_withdrawal: "#F87171",
  loan_disbursement:  "#818CF8",
  loan_repayment:     "#22D3EE",
  transfer:           "#FCD34D",
  fee:                "#94A3B8",
  interest_credit:    "#34D399",
};

const TX_LABELS: Record<string, string> = {
  savings_deposit:    "Savings Deposit",
  savings_withdrawal: "Withdrawal",
  loan_disbursement:  "Loan Disbursed",
  loan_repayment:     "Repayment",
  transfer:           "Transfer",
  fee:                "Fee",
  interest_credit:    "Interest",
};

export function DashboardClient({
  kpis,
  recentTransactions,
}: {
  kpis: KPIs;
  recentTransactions: Transaction[];
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* KPI Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Total Employees"
            value={kpis.totalEmployees.toLocaleString()}
            subtitle={`${kpis.activeEmployees} active`}
            icon={PeopleRounded}
            accent="primary"
            trend="up"
            trendValue="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Total Savings"
            value={formatCurrency(kpis.totalSavings)}
            subtitle="Across all accounts"
            icon={SavingsRounded}
            accent="success"
            trend="up"
            trendValue="+8.3%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Outstanding Loans"
            value={formatCurrency(kpis.totalOutstanding)}
            subtitle={`${kpis.activeLoans} active loans`}
            icon={AccountBalanceRounded}
            accent="accent"
            trend="flat"
            trendValue="0.2%"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Pending Approvals"
            value={kpis.pendingApprovals}
            subtitle="Require review"
            icon={PendingActionsRounded}
            accent={kpis.pendingApprovals > 10 ? "warning" : "primary"}
            trend={kpis.pendingApprovals > 10 ? "up" : "flat"}
            trendValue={kpis.pendingApprovals > 10 ? "High" : "Normal"}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, bgcolor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.06)", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem", color: "#111827" }}>
                Savings Trend
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
                Total savings & monthly contributions (last 12 months)
              </Typography>
            </Box>
            <SavingsAreaChart data={MOCK_SAVINGS_DATA} />
            {/* Legend */}
            <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
              {[
                { color: "#2563EB", label: "Total Savings" },
                { color: "#10B981", label: "Monthly Contributions" },
              ].map(({ color, label }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500 }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, bgcolor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.06)", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem", color: "#111827" }}>
                Loan Activity
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
                Disbursements vs repayments (last 6 months)
              </Typography>
            </Box>
            <LoanBarChart data={MOCK_LOAN_DATA} />
            <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
              {[
                { color: "#2563EB", label: "Disbursed" },
                { color: "#10B981", label: "Repaid" },
              ].map(({ color, label }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500 }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Paper sx={{ p: 3, bgcolor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.06)", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem", color: "#111827" }}>
              Recent Transactions
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
              Latest financial activity across the platform
            </Typography>
          </Box>
          <SwapHorizRounded sx={{ color: "#9CA3AF", fontSize: 20 }} />
        </Box>
        <Divider sx={{ mb: 2.5, borderColor: "rgba(0, 0, 0, 0.06)" }} />

        {recentTransactions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
              No transactions yet. Data will appear here once your Supabase database is connected.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentTransactions.map((tx, i) => (
              <Box key={tx.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.75 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: `${TX_COLORS[tx.type]}15`,
                      border: `1px solid ${TX_COLORS[tx.type]}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <SwapHorizRounded sx={{ fontSize: 18, color: TX_COLORS[tx.type] }} />
                  </Box>
                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
                      {TX_LABELS[tx.type]}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#9CA3AF",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tx.description}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: tx.type === "savings_withdrawal" || tx.type === "loan_disbursement"
                          ? "#EF4444"
                          : "#10B981",
                      }}
                    >
                      {tx.type === "savings_withdrawal" || tx.type === "loan_disbursement" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                      {formatDate(tx.created_at)}
                    </Typography>
                  </Box>
                </Box>
                {i < recentTransactions.length - 1 && (
                  <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.03)" }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
