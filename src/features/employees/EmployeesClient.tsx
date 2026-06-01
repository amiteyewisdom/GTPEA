"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import {
  SearchRounded,
  AddRounded,
  MoreVertRounded,
  FileDownloadRounded,
} from "@mui/icons-material";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Employee } from "@/types/database";

interface EmployeesClientProps {
  employees: Employee[];
  total: number;
}

export function EmployeesClient({ employees, total }: EmployeesClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
      emp.employee_no.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Header bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, flex: 1, maxWidth: 420 }}>
          <TextField
            placeholder="Search employees…"
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<FileDownloadRounded />}>
            Export
          </Button>
          <Button variant="contained" size="small" startIcon={<AddRounded />}>
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Stats strip */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {[
          { label: "Total", value: total, color: "#818CF8" },
          { label: "Active", value: employees.filter((e) => e.status === "active").length, color: "#34D399" },
          { label: "Inactive", value: employees.filter((e) => e.status === "inactive").length, color: "#94A3B8" },
          { label: "Suspended", value: employees.filter((e) => e.status === "suspended").length, color: "#FCD34D" },
        ].map(({ label, value, color }) => (
          <Box
            key={label}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1.5,
              bgcolor: "#0E1117",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color }}>{value}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Employee</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}>Employee No.</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Department</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Position</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Salary</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}>Date Joined</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                    {search
                      ? "No employees match your search."
                      : "No employees yet. Add your first employee to get started."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={emp.avatar_url ?? undefined}
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          bgcolor: "rgba(99,102,241,0.15)",
                          color: "#818CF8",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                      >
                        {emp.first_name[0]}{emp.last_name[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                          {emp.first_name} {emp.last_name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {emp.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography sx={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "text.secondary" }}>
                      {emp.employee_no}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Chip
                      label={emp.department.replace("_", " ")}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        textTransform: "capitalize",
                        bgcolor: "rgba(99,102,241,0.08)",
                        color: "#818CF8",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: 1,
                        "& .MuiChip-label": { px: 0.875 },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', md: 'table-cell' } }}>
                    {emp.position}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                    {formatCurrency(emp.salary)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', sm: 'table-cell' } }}>
                    {formatDate(emp.date_joined)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={emp.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="More options">
                      <IconButton size="small">
                        <MoreVertRounded sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
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
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "0.8125rem",
              color: "text.secondary",
            },
          }}
        />
      </TableContainer>
    </Box>
  );
}
