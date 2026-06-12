"use client";

import { useState } from "react";
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, LinearProgress, Tooltip, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from "@mui/material";
import { SearchRounded, AddRounded, MoreVertRounded, ScheduleRounded, DownloadRounded, UploadRounded } from "@mui/icons-material";
import {
  AccountBalanceRounded, MoneyOffRounded, WarningAmberRounded,
} from "@mui/icons-material";
import { StatusChip } from "@/components/ui/StatusChip";
import { KPICard } from "@/components/ui/KPICard";
import { formatCurrency, formatDate, generateAmortizationSchedule } from "@/utils/formatters";
import { LoanApplication } from "@/features/loans/LoanApplication";

interface LoanRow {
  id: string;
  loan_ref: string;
  status: string;
  amount_requested: number;
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
}

const ALL_TABS = ["all", "pending", "approved", "disbursed", "repaying", "completed", "rejected", "defaulted"];

export function LoansClient({ loans, loanProducts, total, totalDisbursed, totalOutstanding }: LoansClientProps) {
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        <KPICard title="Total Loans" value={total} icon={AccountBalanceRounded} accent="primary" subtitle="All records" />
        <KPICard title="Total Disbursed" value={formatCurrency(totalDisbursed)} icon={AccountBalanceRounded} accent="success" trend="up" trendValue="+14%" subtitle="Cumulative" />
        <KPICard title="Outstanding Balance" value={formatCurrency(totalOutstanding)} icon={MoneyOffRounded} accent="accent" subtitle="Active portfolio" />
        <KPICard title="Defaulted" value={defaulted} icon={WarningAmberRounded} accent={defaulted > 0 ? "danger" : "primary"} subtitle={`${((defaulted / Math.max(total, 1)) * 100).toFixed(1)}% default rate`} />
      </Box>

      <LoanApplication loanProducts={loanProducts} />

      {/* Controls */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <TextField
          placeholder="Search loans…"
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadRounded />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRounded />}
            onClick={() => handleExport('loans')}
          >
            Export Loans
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRounded />}
            onClick={() => handleExport('all')}
          >
            Export All
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRounded />}
            onClick={() => document.getElementById("loan-application")?.scrollIntoView({ behavior: "smooth" })}
          >
            New Loan Application
          </Button>
        </Box>
      </Box>

      {/* Status tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(0); }}
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.8125rem", minHeight: 40, py: 0 },
          "& .MuiTabs-indicator": { backgroundColor: "#6366F1", height: 2 },
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {ALL_TABS.map((t) => (
          <Tab
            key={t}
            label={t.charAt(0).toUpperCase() + t.slice(1)}
            value={t}
          />
        ))}
      </Tabs>

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Borrower</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}>Loan Ref</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Product</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Amount</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Outstanding</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', lg: 'table-cell' } }}>Repayment Progress</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Monthly</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Disbursed</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                    {search ? "No loans match your search." : `No ${tab === "all" ? "" : tab + " "}loans found.`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((loan) => {
                const progress = repaymentProgress(loan);
                return (
                  <TableRow key={loan.id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {loan.employees ? `${loan.employees.first_name} ${loan.employees.last_name}` : "—"}
                      </Typography>
                      {loan.employees && (
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {loan.employees.employee_no}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography sx={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "#818CF8" }}>
                        {loan.loan_ref}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', md: 'table-cell' } }}>
                      {loan.loan_products?.name ?? "—"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {formatCurrency(loan.amount_requested)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: loan.outstanding_balance > 0 ? "#F87171" : "#34D399", fontWeight: 600 }}>
                      {formatCurrency(loan.outstanding_balance)}
                    </TableCell>
                    <TableCell sx={{ minWidth: 140, display: { xs: 'none', lg: 'table-cell' } }}>
                      {progress !== null ? (
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                          />
                          <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                            {progress.toFixed(0)}% repaid
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', md: 'table-cell' } }}>
                      {formatCurrency(loan.monthly_repayment)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#818CF8", fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>
                      {loan.interest_rate}%
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', sm: 'table-cell' } }}>
                      {loan.disbursement_date ? formatDate(loan.disbursement_date) : "—"}
                    </TableCell>
                    <TableCell><StatusChip status={loan.status} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="View amortization schedule">
                        <IconButton 
                          size="small" 
                          onClick={() => setSelectedLoan(loan)}
                          sx={{ color: "#818CF8" }}
                        >
                          <ScheduleRounded sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        />
      </TableContainer>

      {/* Amortization Schedule Dialog */}
      <Dialog open={!!selectedLoan} onClose={() => setSelectedLoan(null)} maxWidth="md" fullWidth>
        <DialogTitle>Amortization Schedule</DialogTitle>
        <DialogContent>
          {selectedLoan && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "1fr 1fr 1fr", p: 2, bgcolor: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Loan Amount</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selectedLoan.amount_requested)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Interest Rate</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{selectedLoan.interest_rate}%</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Term</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{selectedLoan.term_months} months</Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Principal</TableCell>
                      <TableCell align="right">Interest</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {generateAmortizationSchedule(
                      selectedLoan.amount_requested,
                      selectedLoan.term_months,
                      selectedLoan.interest_rate * 100,
                      selectedLoan.disbursement_date ? new Date(selectedLoan.disbursement_date) : undefined,
                      selectedLoan.interest_calc_method ?? 'reducing_balance'
                    ).map((payment, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{payment.month}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.principal)}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.interest)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(payment.total)}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.closing_balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLoan(null)} variant="outlined" size="small">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Loan Applications</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
            <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
              Upload a CSV file to import loan applications. The file should contain columns: Reference, Employee No, Amount Requested, Amount Approved, Interest Rate, Term (months), Monthly Repayment, Purpose, Status, Created At.
            </Typography>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="import-file-input"
            />
            <label htmlFor="import-file-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
              >
                {importFile ? importFile.name : "Select CSV File"}
              </Button>
            </label>
            {importResult && (
              <Alert severity={importResult.imported > 0 ? "success" : "error"}>
                {importResult.imported > 0 
                  ? `Successfully imported ${importResult.imported} loan applications.`
                  : `Import failed. ${importResult.errors?.join(', ') || 'Unknown error'}`}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button
            onClick={handleImport}
            variant="contained"
            size="small"
            disabled={!importFile || importLoading}
          >
            {importLoading ? "Importing..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
