"use client";

import { useMemo, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import DashboardStatCard from "@/components/ui/DashboardStatCard";
import { SavingsAreaChart } from "@/components/charts/SavingsAreaChart";
import { LoanBarChart } from "@/components/charts/LoanBarChart";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/formatters";
import { useDownload } from "@/hooks/use-download";
import type { ReportType } from "@/lib/reports/build-report";
import {
  Users,
  PiggyBank,
  Landmark,
  Banknote,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  BarChart3,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

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

type Tab = "overview" | "trends" | "export";
type ReportCategory = "all" | "finance" | "people" | "compliance";

const REPORTS: {
  type: ReportType;
  label: string;
  desc: string;
  icon: LucideIcon;
  category: Exclude<ReportCategory, "all">;
}[] = [
  {
    type: "savings",
    label: "Savings Summary",
    desc: "Balances, contributions, and account activity",
    icon: PiggyBank,
    category: "finance",
  },
  {
    type: "loans",
    label: "Loan Disbursements",
    desc: "Disbursement amounts, dates, and borrower details",
    icon: Landmark,
    category: "finance",
  },
  {
    type: "repayments",
    label: "Repayment Schedule",
    desc: "Upcoming and overdue repayments by employee",
    icon: Banknote,
    category: "finance",
  },
  {
    type: "employees",
    label: "Employee Status",
    desc: "Current roster with department breakdown",
    icon: Users,
    category: "people",
  },
  {
    type: "defaults",
    label: "Default & Risk",
    desc: "Defaulted loans and recovery progress",
    icon: AlertTriangle,
    category: "compliance",
  },
  {
    type: "approvals",
    label: "Approval Audit",
    desc: "Full approval history with reviewer timeline",
    icon: ClipboardCheck,
    category: "compliance",
  },
];

const CATEGORY_LABELS: Record<Exclude<ReportCategory, "all">, string> = {
  finance: "Finance",
  people: "People",
  compliance: "Compliance",
};

export function ReportsClient({
  summary,
  savingsChartData = [],
  loanChartData = [],
}: {
  summary: ReportSummary;
  savingsChartData?: ChartData[];
  loanChartData?: ChartData[];
}) {
  const { download, openPrintView, loading } = useDownload();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReportCategory>("all");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return REPORTS.filter((report) => {
      const matchesCategory = category === "all" || report.category === category;
      const matchesSearch =
        !query ||
        report.label.toLowerCase().includes(query) ||
        report.desc.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  async function handleCsvExport(type: ReportType) {
    setActiveReport(type);
    await download(`/api/reports/${type}`, `gtpea_${type}_report.csv`);
    setActiveReport(null);
  }

  function handlePdfExport(type: ReportType) {
    openPrintView(`/api/reports/${type}?format=print`);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Reports</h1>
          <p className="text-sm text-brand-text-secondary md:text-base">
            Track platform health, review trends, and download exportable reports.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("export")}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-brand-green px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-green-light sm:self-auto"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Reports
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-brand-card-border pb-4">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={LayoutGrid}>
          Overview
        </TabButton>
        <TabButton active={activeTab === "trends"} onClick={() => setActiveTab("trends")} icon={BarChart3}>
          Trends
        </TabButton>
        <TabButton active={activeTab === "export"} onClick={() => setActiveTab("export")} icon={FileSpreadsheet}>
          Downloads
        </TabButton>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 [&>*]:min-w-0">
            <DashboardStatCard
              title="Total Employees"
              value={formatNumber(summary.totalEmployees)}
              icon={Users}
              color="text-brand-accent"
            />
            <DashboardStatCard
              title="Total Savings"
              value={formatCurrency(summary.totalSavings)}
              icon={PiggyBank}
              color="text-brand-success"
            />
            <DashboardStatCard
              title="Active Loans"
              value={formatNumber(summary.activeLoans)}
              icon={Landmark}
              color="text-brand-accent"
            />
            <DashboardStatCard
              title="Total Disbursed"
              value={formatCurrency(summary.totalDisbursed)}
              icon={Banknote}
              color="text-brand-success"
            />
            <DashboardStatCard
              title="Outstanding Balance"
              value={formatCurrency(summary.totalOutstanding)}
              icon={Wallet}
              color="text-brand-warning"
            />
            <DashboardStatCard
              title="Total Withdrawals"
              value={formatCurrency(summary.totalWithdrawals)}
              icon={Wallet}
              color="text-brand-accent"
            />
            <DashboardStatCard
              title="Total Dividends"
              value={formatCurrency(summary.totalDividends)}
              icon={TrendingUp}
              color="text-brand-success"
            />
            <DashboardStatCard
              title="Default Rate"
              value={formatPercent(summary.defaultRate)}
              icon={AlertTriangle}
              color={summary.defaultRate > 5 ? "text-brand-danger" : "text-brand-green"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <GlassCard className="p-5">
              <p className="text-sm text-brand-text-secondary">Pending Approvals</p>
              <p className="mt-1 text-2xl font-bold text-brand-text">{formatNumber(summary.totalApprovals)}</p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-sm text-brand-text-secondary">Loan Portfolio Health</p>
              <p className="mt-1 text-2xl font-bold text-brand-text">
                {summary.defaultRate > 5 ? "Needs attention" : "Stable"}
              </p>
            </GlassCard>
            <GlassCard
              className="cursor-pointer p-5 transition-all hover:bg-brand-hover"
              onClick={() => setActiveTab("export")}
            >
              <p className="text-sm text-brand-text-secondary">Available Reports</p>
              <p className="mt-1 text-2xl font-bold text-brand-text">{REPORTS.length}</p>
              <p className="mt-2 text-xs text-brand-accent">Go to downloads →</p>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <GlassCard className="p-5 lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-brand-text">Savings Trend</h2>
              <p className="text-sm text-brand-text-secondary">
                Total savings pool vs monthly contributions
              </p>
            </div>
            {savingsChartData.length > 0 ? (
              <SavingsAreaChart data={savingsChartData} />
            ) : (
              <ChartEmptyState message="No savings contribution data yet." />
            )}
          </GlassCard>

          <GlassCard className="p-5 lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-brand-text">Loan Activity</h2>
              <p className="text-sm text-brand-text-secondary">Disbursements vs repayments by month</p>
            </div>
            {loanChartData.length > 0 ? (
              <LoanBarChart data={loanChartData} />
            ) : (
              <ChartEmptyState message="No loan transaction data yet." />
            )}
          </GlassCard>
        </div>
      )}

      {activeTab === "export" && (
        <div className="space-y-4">
          <GlassCard className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search reports..."
                  className="w-full rounded-lg border border-brand-card-border bg-white py-2.5 pl-10 pr-4 text-sm text-brand-text outline-none transition-all focus:border-brand-accent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "finance", "people", "compliance"] as ReportCategory[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      category === item
                        ? "bg-brand-green text-white"
                        : "border border-brand-card-border bg-white text-brand-text-secondary hover:bg-brand-hover"
                    }`}
                  >
                    {item === "all" ? "All" : CATEGORY_LABELS[item]}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          {filteredReports.length === 0 ? (
            <GlassCard className="p-10 text-center">
              <p className="text-brand-text-secondary">No reports match your search.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.type}
                  report={report}
                  loading={loading && activeReport === report.type}
                  onCsv={() => handleCsvExport(report.type)}
                  onPdf={() => handlePdfExport(report.type)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border border-brand-accent/30 bg-brand-accent/20 text-brand-accent"
          : "text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function ReportCard({
  report,
  loading,
  onCsv,
  onPdf,
}: {
  report: (typeof REPORTS)[number];
  loading: boolean;
  onCsv: () => void;
  onPdf: () => void;
}) {
  const Icon = report.icon;

  return (
    <GlassCard className="flex h-full flex-col p-5 transition-all hover:border-brand-accent/40">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-lg bg-brand-accent/15 p-2.5 text-brand-accent">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-brand-card-border bg-brand-hover px-2.5 py-1 text-xs font-medium text-brand-text-secondary">
          {CATEGORY_LABELS[report.category]}
        </span>
      </div>

      <h3 className="mb-1 font-semibold text-brand-text">{report.label}</h3>
      <p className="mb-5 flex-1 text-sm text-brand-text-secondary">{report.desc}</p>

      <div className="flex gap-2">
        <button
          onClick={onCsv}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-green px-3 py-2 text-sm font-medium text-white transition-all hover:bg-brand-green-light disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {loading ? "Downloading..." : "CSV"}
        </button>
        <button
          onClick={onPdf}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm font-medium text-brand-text transition-all hover:bg-brand-hover"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>
    </GlassCard>
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-brand-card-border bg-brand-hover/50 px-6 text-center">
      <BarChart3 className="mb-3 h-8 w-8 text-brand-text-secondary/60" />
      <p className="text-sm text-brand-text-secondary">{message}</p>
    </div>
  );
}
