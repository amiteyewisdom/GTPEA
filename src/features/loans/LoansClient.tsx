"use client";

import { useState } from "react";
import { Search, Download, Upload, Plus, Calendar, Landmark, TrendingDown, AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import { KPICard } from "@/components/ui/KPICard";
import { formatCurrency, formatDate, generateAmortizationSchedule } from "@/utils/formatters";
import { LoanApplication } from "@/features/loans/LoanApplication";

interface LoanRow {
  id: string;
  loan_ref: string;
  status: string;
  amount_requested: number;
  amount_approved: number | null;
  amount_disbursed: number | null;
  outstanding_balance: number;
  monthly_repayment: number;
  interest_rate: number;
  interest_calc_method?: "reducing_balance" | "flat_rate";
  term_months: number;
  disbursement_date: string | null;
  created_at: string;
  employees?: { first_name: string; last_name: string; employee_no: string } | null;
  loan_products?: { name: string } | null;
}

interface LoanProductOption {
  id: string;
  name: string;
  interest_rate: number;
  interest_calc_method: "reducing_balance" | "flat_rate";
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  account_code?: string | null;
  description?: string | null;
}

interface LoansClientProps {
  loans: LoanRow[];
  loanProducts: LoanProductOption[];
  total: number;
  totalDisbursed: number;
  totalOutstanding: number;
  userRole?: string;
}

const ALL_TABS = ["all", "pending", "approved", "disbursed", "repaying", "completed", "rejected", "defaulted"];

export function LoansClient({ loans, loanProducts, total, totalDisbursed, totalOutstanding, userRole }: LoansClientProps) {
  const isEmployee = userRole === "employee";
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLoan, setSelectedLoan] = useState<LoanRow | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors?: string[] } | null>(null);

  const defaulted = loans.filter((l) => l.status === "defaulted").length;

  const filtered = loans.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      l.loan_ref.toLowerCase().includes(q) ||
      (l.employees
        ? `${l.employees.first_name} ${l.employees.last_name}`.toLowerCase().includes(q)
        : false);
    const matchesTab = tab === "all" || l.status === tab;
    return matchesSearch && matchesTab;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const repaymentProgress = (loan: LoanRow) => {
    if (!loan.amount_disbursed || loan.amount_disbursed === 0) return null;
    const paid = loan.amount_disbursed - loan.outstanding_balance;
    return Math.min((paid / loan.amount_disbursed) * 100, 100);
  };

  const handleExport = async (type: 'loans' | 'all') => {
    try {
      const response = await fetch(`/api/export/applications?type=${type}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setImportLoading(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', 'loans');
      
      const response = await fetch('/api/import/applications', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Import failed');
      
      setImportResult(result);
      if (result.imported > 0) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({ imported: 0, errors: [(error as Error).message] });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard title="Total Loans" value={total} icon={Landmark} accent="primary" subtitle="All records" />
        <KPICard title="Total Disbursed" value={formatCurrency(totalDisbursed)} icon={Landmark} accent="success" trend="up" trendValue="+14%" subtitle="Cumulative" />
        <KPICard title="Outstanding Balance" value={formatCurrency(totalOutstanding)} icon={TrendingDown} accent="accent" subtitle="Active portfolio" />
        <KPICard title="Defaulted" value={defaulted} icon={AlertTriangle} accent={defaulted > 0 ? "danger" : "primary"} subtitle={`${((defaulted / Math.max(total, 1)) * 100).toFixed(1)}% default rate`} />
      </div>

      {isEmployee && <LoanApplication loanProducts={loanProducts} />}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search loans…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-brand border border-brand-card-border bg-white py-2 pl-9 pr-3 text-sm text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setImportDialogOpen(true)} className="flex items-center gap-1.5 rounded-brand border border-brand-card-border bg-white px-3 py-2 text-xs font-medium text-brand-text-secondary hover:bg-brand-hover">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button onClick={() => handleExport('loans')} className="flex items-center gap-1.5 rounded-brand border border-brand-card-border bg-white px-3 py-2 text-xs font-medium text-brand-text-secondary hover:bg-brand-hover">
            <Download className="h-3.5 w-3.5" /> Export Loans
          </button>
          <button onClick={() => handleExport('all')} className="flex items-center gap-1.5 rounded-brand border border-brand-card-border bg-white px-3 py-2 text-xs font-medium text-brand-text-secondary hover:bg-brand-hover">
            <Download className="h-3.5 w-3.5" /> Export All
          </button>
          <button
            onClick={() => document.getElementById("loan-application")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-1.5 rounded-brand bg-brand-green px-3 py-2 text-xs font-semibold text-white hover:bg-brand-green-dark"
          >
            <Plus className="h-3.5 w-3.5" /> New Loan
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-brand-card-border pb-0">
        {ALL_TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(0); }}
            className={`shrink-0 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
              tab === t
                ? "border-brand-green text-brand-green"
                : "border-transparent text-brand-text-secondary hover:text-brand-text"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-brand border border-brand-card-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-brand-card-border bg-brand-background">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Borrower</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary sm:table-cell">Loan Ref</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary md:table-cell">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Outstanding</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary lg:table-cell">Progress</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary md:table-cell">Monthly</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary sm:table-cell">Rate</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary sm:table-cell">Disbursed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-card-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-brand-text-secondary">
                    {search ? "No loans match your search." : `No ${tab === "all" ? "" : tab + " "}loans found.`}
                  </td>
                </tr>
              ) : (
                paginated.map((loan) => {
                  const progress = repaymentProgress(loan);
                  const displayedAmount = Number(loan.amount_approved) || Number(loan.amount_requested) || 0;
                  const outstandingBalance = Number(loan.outstanding_balance) || displayedAmount;
                  const disbursedAmount = Number(loan.amount_disbursed) || displayedAmount;
                  return (
                    <tr key={loan.id} className="hover:bg-brand-hover/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-text">
                          {loan.employees ? `${loan.employees.first_name} ${loan.employees.last_name}` : "—"}
                        </p>
                        {loan.employees && <p className="text-xs text-brand-text-secondary">{loan.employees.employee_no}</p>}
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-indigo-500 sm:table-cell">{loan.loan_ref}</td>
                      <td className="hidden px-4 py-3 text-sm text-brand-text-secondary md:table-cell">{loan.loan_products?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-brand-text">{formatCurrency(loan.amount_requested)}</td>
                      <td className={`px-4 py-3 font-semibold ${outstandingBalance > 0 ? "text-red-500" : "text-green-500"}`}>
                        {formatCurrency(outstandingBalance)}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {progress !== null ? (
                          <div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-brand-green" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-brand-text-secondary">{progress.toFixed(0)}% repaid</p>
                          </div>
                        ) : <span className="text-sm text-brand-text-secondary">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-brand-text-secondary md:table-cell">{formatCurrency(loan.monthly_repayment)}</td>
                      <td className="hidden px-4 py-3 font-semibold text-indigo-500 sm:table-cell">{loan.interest_rate}%</td>
                      <td className="hidden px-4 py-3 text-sm text-brand-text-secondary sm:table-cell">
                        {formatCurrency(disbursedAmount)}
                      </td>
                      <td className="px-4 py-3"><StatusChip status={loan.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          title="View amortization schedule"
                          onClick={() => setSelectedLoan(loan)}
                          className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 transition-colors"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-brand-card-border px-4 py-3 text-sm text-brand-text-secondary">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} className="rounded border border-brand-card-border bg-white px-2 py-1 text-xs">
              {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span>{filtered.length === 0 ? "0–0" : `${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, filtered.length)}`} of {filtered.length}</span>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded p-1 hover:bg-brand-hover disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * rowsPerPage >= filtered.length} className="rounded p-1 hover:bg-brand-hover disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedLoan(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-brand bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-card-border px-6 py-4">
              <h2 className="text-lg font-bold text-brand-text">Amortization Schedule</h2>
              <button onClick={() => setSelectedLoan(null)} className="rounded-lg p-1 hover:bg-brand-hover"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-4 p-6">
              <div className="grid grid-cols-3 gap-4 rounded-brand border border-brand-card-border bg-brand-background p-4">
                {[
                  { label: "Loan Amount", value: formatCurrency(selectedLoan.amount_requested) },
                  { label: "Interest Rate", value: `${selectedLoan.interest_rate}%` },
                  { label: "Term", value: `${selectedLoan.term_months} months` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-brand-text-secondary">{label}</p>
                    <p className="text-sm font-semibold text-brand-text">{value}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-auto rounded-brand border border-brand-card-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-brand-card-border bg-brand-background">
                    <tr>
                      {["Month", "Principal", "Interest", "Total", "Balance"].map((h) => (
                        <th key={h} className="px-3 py-2 text-right text-xs font-semibold uppercase text-brand-text-secondary first:text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-card-border">
                    {generateAmortizationSchedule(
                      selectedLoan.amount_requested,
                      selectedLoan.term_months,
                      selectedLoan.interest_rate * 100,
                      selectedLoan.disbursement_date ? new Date(selectedLoan.disbursement_date) : undefined,
                      selectedLoan.interest_calc_method ?? "reducing_balance"
                    ).map((payment, index) => (
                      <tr key={index} className="hover:bg-brand-hover/50">
                        <td className="px-3 py-2 text-brand-text">{payment.month}</td>
                        <td className="px-3 py-2 text-right text-brand-text-secondary">{formatCurrency(payment.principal)}</td>
                        <td className="px-3 py-2 text-right text-brand-text-secondary">{formatCurrency(payment.interest)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-brand-text">{formatCurrency(payment.total)}</td>
                        <td className="px-3 py-2 text-right text-brand-text-secondary">{formatCurrency(payment.closing_balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end border-t border-brand-card-border px-6 py-4">
              <button onClick={() => setSelectedLoan(null)} className="rounded-brand border border-brand-card-border px-4 py-2 text-sm font-medium text-brand-text-secondary hover:bg-brand-hover">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setImportDialogOpen(false)}>
          <div className="w-full max-w-md rounded-brand bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-card-border px-6 py-4">
              <h2 className="text-lg font-bold text-brand-text">Import Loan Applications</h2>
              <button onClick={() => setImportDialogOpen(false)} className="rounded-lg p-1 hover:bg-brand-hover"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-4 p-6">
              <p className="text-sm text-brand-text-secondary">Upload a CSV file with columns: Reference, Employee No, Amount Requested, Amount Approved, Interest Rate, Term (months), Monthly Repayment, Purpose, Status, Created At.</p>
              <input type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="hidden" id="import-file-input" />
              <label htmlFor="import-file-input" className="flex cursor-pointer items-center justify-center rounded-brand border-2 border-dashed border-brand-card-border px-4 py-6 text-sm text-brand-text-secondary hover:border-brand-green hover:text-brand-green transition-colors">
                <Upload className="mr-2 h-4 w-4" />
                {importFile ? importFile.name : "Click to select CSV file"}
              </label>
              {importResult && (
                <div className={`rounded-brand border px-4 py-3 text-sm ${importResult.imported > 0 ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                  {importResult.imported > 0
                    ? `Successfully imported ${importResult.imported} loan applications.`
                    : `Import failed: ${importResult.errors?.join(", ") || "Unknown error"}`}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-brand-card-border px-6 py-4">
              <button onClick={() => setImportDialogOpen(false)} className="rounded-brand border border-brand-card-border px-4 py-2 text-sm font-medium text-brand-text-secondary hover:bg-brand-hover">Cancel</button>
              <button onClick={handleImport} disabled={!importFile || importLoading} className="rounded-brand bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-50">
                {importLoading ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
