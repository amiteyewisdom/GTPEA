"use client";

import { useState } from "react";
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, LinearProgress, Tooltip, IconButton,
} from "@mui/material";
import { SearchRounded, AddRounded, MoreVertRounded } from "@mui/icons-material";
import { StatusChip } from "@/components/ui/StatusChip";
import { KPICard } from "@/components/ui/KPICard";
import { SavingsRounded, PeopleRounded, TrendingUpRounded } from "@mui/icons-material";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface SavingsRow {
  id: string;
  account_number: string;
  type: string;
  status: string;
  balance: number;
  monthly_contribution: number;
  target_amount: number | null;
  interest_rate: number;
  opened_at: string;
  employees?: {
    first_name: string;
    last_name: string;
    employee_no: string;
    department: string;
  } | null;
}

interface SavingsClientProps {
  savings: SavingsRow[];
  total: number;
  totalBalance: number;
}

export function SavingsClient({ savings, total, totalBalance }: SavingsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = savings.filter((s) => {
    const q = search.toLowerCase();
    const name = s.employees
      ? `${s.employees.first_name} ${s.employees.last_name}`.toLowerCase()
      : "";
    return (
      name.includes(q) ||
      s.account_number.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const avgBalance = total > 0 ? totalBalance / total : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* KPI strip */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        <KPICard title="Total Savings Pool" value={formatCurrency(totalBalance)} icon={SavingsRounded} accent="success" trend="up" trendValue="+8.3%" subtitle="All active accounts" />
        <KPICard title="Total Accounts" value={total} icon={PeopleRounded} accent="primary" subtitle={`${savings.filter(s => s.status === "active").length} active`} />
        <KPICard title="Average Balance" value={formatCurrency(avgBalance)} icon={TrendingUpRounded} accent="accent" subtitle="Per account" />
      </Box>

      {/* Controls */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <TextField
          placeholder="Search accounts…"
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" size="small" startIcon={<AddRounded />}>
          New Savings Account
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Account Holder</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}>Account No.</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Type</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Balance</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Monthly</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', lg: 'table-cell' } }}>Progress</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Rate</TableCell>
              <TableCell>Opened</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                    {search ? "No accounts match your search." : "No savings accounts yet."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((s) => {
                const progress =
                  s.target_amount && s.target_amount > 0
                    ? Math.min((s.balance / s.target_amount) * 100, 100)
                    : null;
                return (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {s.employees
                          ? `${s.employees.first_name} ${s.employees.last_name}`
                          : "—"}
                      </Typography>
                      {s.employees && (
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {s.employees.employee_no}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography sx={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "text.secondary" }}>
                        {s.account_number}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize", fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', md: 'table-cell' } }}>
                      {s.type}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#34D399" }}>
                      {formatCurrency(s.balance)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', md: 'table-cell' } }}>
                      {formatCurrency(s.monthly_contribution)}
                    </TableCell>
                    <TableCell sx={{ minWidth: 120, display: { xs: 'none', lg: 'table-cell' } }}>
                      {progress !== null ? (
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                          />
                          <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                            {progress.toFixed(0)}% of {formatCurrency(s.target_amount!)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#818CF8", fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>
                      {s.interest_rate}%
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', sm: 'table-cell' } }}>
                      {formatDate(s.opened_at)}
                    </TableCell>
                    <TableCell><StatusChip status={s.status} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="More options">
                        <IconButton size="small">
                          <MoreVertRounded sx={{ fontSize: 18 }} />
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
    </Box>
  );
}
