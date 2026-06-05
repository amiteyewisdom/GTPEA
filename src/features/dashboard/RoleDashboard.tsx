import { Box, Grid, Typography, Paper, Button } from "@mui/material";
import {
  PeopleRounded,
  SavingsRounded,
  AccountBalanceRounded,
  PendingActionsRounded,
  BarChartRounded,
  ShieldRounded,
  SupportRounded,
  InsertChartRounded,
  EmojiEventsRounded,
} from "@mui/icons-material";
import { KPICard } from "@/components/ui/KPICard";
import { formatCurrency } from "@/utils/formatters";
import type { UserRole } from "@/types/index";

interface DashboardMetrics {
  totalEmployees?: number;
  activeEmployees?: number;
  totalLoansOutstanding?: number;
  pendingApprovals?: number;
  activeLoans?: number;
  loanProductsActive?: number;
  myPendingApplications?: number;
  myActiveLoans?: number;
  myOutstandingBalance?: number;
  approvalsAwaitingSignature?: number;
  fundBalance?: number;
  reviewsInQueue?: number;
  savingsAccounts?: number;
}

interface RoleDashboardProps {
  user: { full_name: string; role: UserRole; employee_id?: string | null };
  metrics: DashboardMetrics;
}

const ROLE_TITLES: Record<UserRole, string> = {
  super_admin: "Global Operator",
  administrator: "Operations Commander",
  admin: "Operations Commander",
  fund_manager: "Fund Manager",
  union_rep: "Member Advocate",
  chairperson: "Board Chair",
  chairman: "Board Chair",
  employee: "Member",
};

const ROLE_SUBTITLES: Record<UserRole, string> = {
  super_admin: "Oversee platform health, member operations and credit governance.",
  administrator: "Manage loan products, approvals and member workflows with full control.",
  fund_manager: "Monitor the fund pipeline, disbursements and portfolio risk posture.",
  union_rep: "Support member loan requests and keep approval momentum moving.",
  chairperson: "Authorize strategic approvals and review board-level performance.",
  chairman: "Authorize strategic approvals and review board-level performance.",
  employee: "Track your savings, loan applications and member support experience.",
};

function DashboardHeader({ user }: { user: { full_name: string; role: UserRole } }) {
  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        background: "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(14,165,233,0.08))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      <Box sx={{ position: "absolute", top: -24, right: -24, width: 180, height: 180, borderRadius: "50%", bgcolor: "rgba(59,130,246,0.12)", filter: "blur(48px)" }} />
      <Typography sx={{ textTransform: "uppercase", fontSize: "0.75rem", color: "#38BDF8", letterSpacing: "0.18em", mb: 1.5, fontWeight: 700 }}>
        {ROLE_TITLES[user.role]}
      </Typography>
      <Typography sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, fontWeight: 800, color: "#F8FAFC", mb: 1 }}>
        Welcome back, {user.full_name.split(" ")[0]}.
      </Typography>
      <Typography sx={{ maxWidth: 760, color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.8 }}>
        {ROLE_SUBTITLES[user.role]}
      </Typography>
    </Paper>
  );
}

function getRoleCards(role: UserRole, metrics: DashboardMetrics) {
  switch (role) {
    case "super_admin":
    case "admin":
    case "administrator":
      return [
        {
          title: "Active Members",
          value: metrics.activeEmployees?.toLocaleString() ?? "0",
          subtitle: `${metrics.totalEmployees?.toLocaleString() ?? "0"} total employees`,
          icon: PeopleRounded,
          accent: "primary" as const,
          trend: "up" as const,
          trendValue: "Stable",
        },
        {
          title: "Open Approvals",
          value: metrics.pendingApprovals ?? 0,
          subtitle: "Pending review across credit workflows",
          icon: PendingActionsRounded,
          accent: "warning" as const,
          trend: "flat" as const,
          trendValue: "Waiting",
        },
        {
          title: "Credit Products",
          value: metrics.loanProductsActive ?? 0,
          subtitle: "Active loan products",
          icon: AccountBalanceRounded,
          accent: "accent" as const,
          trend: "up" as const,
          trendValue: "Live",
        },
        {
          title: "Portfolio Exposure",
          value: formatCurrency(metrics.totalLoansOutstanding ?? 0),
          subtitle: "Outstanding loan balance",
          icon: SavingsRounded,
          accent: "danger" as const,
          trend: "down" as const,
          trendValue: "Under watch",
        },
      ];
    case "fund_manager":
      return [
        {
          title: "Pending Approvals",
          value: metrics.pendingApprovals ?? 0,
          subtitle: "Awaiting your action",
          icon: PendingActionsRounded,
          accent: "warning" as const,
          trend: "up" as const,
          trendValue: "High load",
        },
        {
          title: "Active Loans",
          value: metrics.activeLoans ?? 0,
          subtitle: "In credit pipeline",
          icon: BarChartRounded,
          accent: "accent" as const,
          trend: "flat" as const,
          trendValue: "Steady",
        },
        {
          title: "Fund Balance",
          value: formatCurrency(metrics.fundBalance ?? 0),
          subtitle: "Available for disbursement",
          icon: ShieldRounded,
          accent: "success" as const,
          trend: "up" as const,
          trendValue: "Healthy",
        },
        {
          title: "Loan Products",
          value: metrics.loanProductsActive ?? 0,
          subtitle: "Configured offerings",
          icon: AccountBalanceRounded,
          accent: "primary" as const,
          trend: "flat" as const,
          trendValue: "Current",
        },
      ];
    case "union_rep":
      return [
        {
          title: "Pending Cases",
          value: metrics.reviewsInQueue ?? 0,
          subtitle: "Member requests awaiting review",
          icon: SupportRounded,
          accent: "warning" as const,
          trend: "up" as const,
          trendValue: "Busy",
        },
        {
          title: "Loan Pipeline",
          value: metrics.activeLoans ?? 0,
          subtitle: "Member applications in progress",
          icon: AccountBalanceRounded,
          accent: "accent" as const,
          trend: "flat" as const,
          trendValue: "Tracked",
        },
        {
          title: "Active Members",
          value: metrics.totalEmployees?.toLocaleString() ?? "0",
          subtitle: "Members under review",
          icon: PeopleRounded,
          accent: "primary" as const,
          trend: "up" as const,
          trendValue: "Growing",
        },
        {
          title: "Member Savings",
          value: formatCurrency(metrics.fundBalance ?? 0),
          subtitle: "Collective savings view",
          icon: SavingsRounded,
          accent: "success" as const,
          trend: "up" as const,
          trendValue: "Positive",
        },
      ];
    case "chairperson":
    case "chairman":
      return [
        {
          title: "Board Approvals",
          value: metrics.pendingApprovals ?? 0,
          subtitle: "Awaiting final authorization",
          icon: EmojiEventsRounded,
          accent: "warning" as const,
          trend: "flat" as const,
          trendValue: "Pending",
        },
        {
          title: "Risk Exposure",
          value: formatCurrency(metrics.totalLoansOutstanding ?? 0),
          subtitle: "Outstanding loan portfolio",
          icon: ShieldRounded,
          accent: "danger" as const,
          trend: "down" as const,
          trendValue: "Monitor",
        },
        {
          title: "Review Queue",
          value: metrics.reviewsInQueue ?? 0,
          subtitle: "High-priority items",
          icon: AssessmentRounded,
          accent: "accent" as const,
          trend: "up" as const,
          trendValue: "Action",
        },
        {
          title: "System Health",
          value: "Stable",
          subtitle: "Member engagement & approvals",
          icon: InsertChartRounded,
          accent: "primary" as const,
          trend: "up" as const,
          trendValue: "Good",
        },
      ];
    case "employee":
    default:
      return [
        {
          title: "My Active Loans",
          value: metrics.myActiveLoans ?? 0,
          subtitle: "Loans currently open",
          icon: AccountBalanceRounded,
          accent: "accent" as const,
          trend: "flat" as const,
          trendValue: "On track",
        },
        {
          title: "Pending Applications",
          value: metrics.myPendingApplications ?? 0,
          subtitle: "Awaiting approval",
          icon: PendingActionsRounded,
          accent: "warning" as const,
          trend: "up" as const,
          trendValue: "Pending",
        },
        {
          title: "Outstanding Balance",
          value: formatCurrency(metrics.myOutstandingBalance ?? 0),
          subtitle: "Next repayment due soon",
          icon: SavingsRounded,
          accent: "danger" as const,
          trend: "down" as const,
          trendValue: "Due",
        },
        {
          title: "Member Support",
          value: metrics.pendingApprovals ?? 0,
          subtitle: "Requests under review",
          icon: SupportRounded,
          accent: "primary" as const,
          trend: "flat" as const,
          trendValue: "Tracked",
        },
      ];
  }
}

export function RoleDashboard({ user, metrics }: RoleDashboardProps) {
  const cards = getRoleCards(user.role, metrics);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <DashboardHeader user={user} />

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.title}>
            <KPICard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.08)", bgcolor: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(18px)" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", mb: 1.5 }}>
              {user.role === "employee" ? "Personal Summary" : "Operational Highlights"}
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#CBD5E1" }}>
              {user.role === "employee"
                ? "Access your savings, loan applications, and approval tracker from the most important quick links below."
                : "Review the most important credit, member, and approval signals in one place — built for the current role."}
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2, mt: 3 }}>
              {[
                { title: "Fast action", description: "Jump straight to loans, approvals, and member review." },
                { title: "Executive insight", description: "Spot pending items and financial exposure at a glance." },
                { title: "Member impact", description: "Balance approvals with member service priorities." },
                { title: "Platform health", description: "Keep the GTPEA finance experience secure and current." },
              ].map((item) => (
                <Paper key={item.title} sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF", mb: 0.75 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8" }}>{item.description}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.08)", bgcolor: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(18px)" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", mb: 2 }}>
              Role snapshot
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8", mb: 0.5 }}>Role</Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF" }}>{ROLE_TITLES[user.role]}</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8", mb: 0.5 }}>Focus</Typography>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF" }}>
                  {user.role === "employee" ? "Loan & savings review" : "Approval & portfolio oversight"}
                </Typography>
              </Box>
              <Button variant="contained" size="large" sx={{ mt: 1, textTransform: "none", bgcolor: "#38BDF8", color: "#020617", fontWeight: 700, borderRadius: 3, boxShadow: "0 14px 35px rgba(56,189,248,0.18)", '&:hover': { bgcolor: "#22D3EE" } }}>
                Explore current workflows
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
