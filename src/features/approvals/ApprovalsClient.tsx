"use client";

import { useState } from "react";
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, IconButton, Tooltip, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert,
} from "@mui/material";
import {
  SearchRounded, CheckRounded, CloseRounded, OpenInNewRounded,
  PendingActionsRounded, CheckCircleRounded, CancelRounded,
} from "@mui/icons-material";
import { StatusChip } from "@/components/ui/StatusChip";
import { useRouter } from "next/navigation";
import { KPICard } from "@/components/ui/KPICard";
import { formatDate, formatRelativeTime, formatCurrency } from "@/utils/formatters";
import {
  APPROVAL_STAGES,
  canApproveAtStage,
  labelForStage,
  labelForRole,
} from "@/lib/loans/workflow";

interface ApprovalAction {
  stage: number;
  required_role: string;
  action: string;
  notes: string | null;
  actioned_at: string;
}

interface ApprovalRow {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  submitted_by: string;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  current_stage?: number;
  total_stages?: number;
  completed_at?: string | null;
  profiles?: { full_name: string } | null;
  approval_actions?: ApprovalAction[];
  // Additional loan/withdrawal details
  loan_details?: {
    amount_requested: number;
    amount_approved: number | null;
    outstanding_balance: number;
    monthly_repayment: number;
    term_months: number;
    interest_rate: number;
  } | null;
  withdrawal_details?: {
    amount: number;
    savings_balance: number;
    savings_type: string;
  } | null;
  employee_details?: {
    total_savings: number;
    total_loan_balance: number;
    monthly_savings: number;
  } | null;
}

interface ApprovalsClientProps {
  approvals: ApprovalRow[];
  total: number;
  userRole: string;
  userId: string;
}

export function ApprovalsClient({ approvals, total, userRole, userId }: ApprovalsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<ApprovalRow | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [view, setView] = useState<"action" | "all">("action");

  const STAGE_ROLE_MAP: Record<number, string> = Object.fromEntries(
    APPROVAL_STAGES.map((s) => [s.stage, s.role])
  );

  const needsMyAction = (approval: ApprovalRow) =>
    approval.status === "pending" && canApproveAtStage(userRole, approval.current_stage ?? 1);

  const pending = approvals.filter((a) => a.status === "pending").length;
  const myActionCount = approvals.filter(needsMyAction).length;
  const approved = approvals.filter((a) => a.status === "approved").length;
  const rejected = approvals.filter((a) => a.status === "rejected").length;

  // Filter approvals based on user role
  const filtered = approvals.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      a.entity_type.toLowerCase().includes(q) ||
      (a.profiles?.full_name?.toLowerCase().includes(q) ?? false) ||
      a.id.toLowerCase().includes(q);

    // Admins and super_admins see all approvals
    if (userRole === "super_admin" || userRole === "administrator") {
      return matchesSearch;
    }

    const needsMyAttention = needsMyAction(a);
    const iSubmitted = userId ? a.submitted_by === userId : false;

    if (view === "action") {
      return matchesSearch && needsMyAttention;
    }

    return matchesSearch && (needsMyAttention || iSubmitted);
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAction = async (approvalId: string, action: "approved" | "rejected") => {
    setActionLoading(true);
    setActionError(null);
    try {
      const response = await fetch("/api/approvals/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_id: approvalId, action, notes }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to process approval action.");
      }

      setSuccessMessage(payload.message || "Approval updated successfully.");
      setSelected(null);
      setNotes("");
      router.refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unexpected error.");
    }
    setActionLoading(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        <KPICard
          title="Needs My Action"
          value={myActionCount}
          icon={PendingActionsRounded}
          accent={myActionCount > 0 ? "warning" : "primary"}
          subtitle="Ready for your review"
        />
        <KPICard title="Pending Review" value={pending} icon={PendingActionsRounded} accent="primary" subtitle="All pending" />
        <KPICard title="Approved" value={approved} icon={CheckCircleRounded} accent="success" subtitle="This period" />
        <KPICard title="Rejected" value={rejected} icon={CancelRounded} accent="danger" subtitle="This period" />
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          size="small"
          variant={view === "action" ? "contained" : "outlined"}
          onClick={() => { setView("action"); setPage(0); }}
        >
          Needs my action ({myActionCount})
        </Button>
        <Button
          size="small"
          variant={view === "all" ? "contained" : "outlined"}
          onClick={() => { setView("all"); setPage(0); }}
        >
          All relevant
        </Button>
      </Box>

      {/* Controls */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <TextField
          placeholder="Search approvals…"
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
      </Box>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Type</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Submitted By</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Stage</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Submitted</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', lg: 'table-cell' } }}>Status</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                    {search ? "No approvals match your search." : "No approvals found."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((approval) => (
                <TableRow key={approval.id} hover>
                  <TableCell>
                    <Chip
                      label={approval.entity_type.replace("_", " ")}
                      size="small"
                      sx={{
                        height: 22, fontSize: "0.6875rem", fontWeight: 600,
                        textTransform: "capitalize",
                        color: "#22D3EE", bgcolor: "rgba(6,182,212,0.08)",
                        border: "1px solid rgba(6,182,212,0.25)", borderRadius: 1,
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {approval.profiles?.full_name ?? "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
                    {approval.current_stage ?? 1}/{approval.total_stages ?? 3}
                    <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 400 }}>
                      ({labelForStage(approval.current_stage ?? 1)})
                    </Typography>
                    {approval.status === "pending" && needsMyAction(approval) && (
                      <Chip label="Your turn" size="small" color="warning" sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }} />
                    )}
                    {approval.status === "pending" && !needsMyAction(approval) && (
                      <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", mt: 0.5 }}>
                        Waiting for {labelForStage(approval.current_stage ?? 1)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', md: 'table-cell' } }}>
                    <Tooltip title={formatDate(approval.submitted_at, "dd MMM yyyy HH:mm")}>
                      <span>{formatRelativeTime(approval.submitted_at)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', lg: 'table-cell' } }}>
                    <StatusChip status={approval.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      {approval.status === "pending" && needsMyAction(approval) && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleAction(approval.id, "approved")}
                              sx={{ color: "#34D399", "&:hover": { bgcolor: "rgba(16,185,129,0.1)" } }}
                            >
                              <CheckRounded sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => handleAction(approval.id, "rejected")}
                              sx={{ color: "#F87171", "&:hover": { bgcolor: "rgba(239,68,68,0.1)" } }}
                            >
                              <CloseRounded sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => setSelected(approval)}>
                          <OpenInNewRounded sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
          sx={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        />
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Approval Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {actionError && <Alert severity="error">{actionError}</Alert>}
              <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "1fr 1fr" }}>
                {[
                  { label: "Type", value: selected.entity_type.replace("_", " ") },
                  { label: "Reference ID", value: selected.entity_id },
                  { label: "Submitted By", value: selected.profiles?.full_name ?? "—" },
                  { label: "Submitted At", value: formatDate(selected.submitted_at, "dd MMM yyyy, HH:mm") },
                  { label: "Stage", value: `${selected.current_stage ?? 1}/${selected.total_stages ?? 3}` },
                  { label: "Status", value: <StatusChip status={selected.status} /> },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", fontWeight: 500 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>

              {selected.review_notes && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", fontWeight: 500 }}>Previous Notes</Typography>
                  <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>{selected.review_notes}</Typography>
                </Box>
              )}

              {/* Loan Details */}
              {selected.entity_type === 'loan' && selected.loan_details && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, bgcolor: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#22D3EE" }}>Loan Details</Typography>
                  <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "1fr 1fr" }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Amount Requested</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.loan_details.amount_requested)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Amount Approved</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{selected.loan_details.amount_approved ? formatCurrency(selected.loan_details.amount_approved) : "—"}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Outstanding Balance</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.loan_details.outstanding_balance)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Monthly Repayment</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.loan_details.monthly_repayment)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Term</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{selected.loan_details.term_months} months</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Interest Rate</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{selected.loan_details.interest_rate}%</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Withdrawal Details */}
              {selected.entity_type === 'withdrawal' && selected.withdrawal_details && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, bgcolor: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#22D3EE" }}>Withdrawal Details</Typography>
                  <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "1fr 1fr" }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Withdrawal Amount</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.withdrawal_details.amount)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Savings Balance</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.withdrawal_details.savings_balance)}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: "span 2" }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Savings Type</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{selected.withdrawal_details.savings_type}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Employee Financial Summary */}
              {selected.employee_details && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, bgcolor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#10B981" }}>Employee Financial Summary</Typography>
                  <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Total Savings</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.employee_details.total_savings)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Total Loan Balance</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.employee_details.total_loan_balance)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Monthly Savings</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{formatCurrency(selected.employee_details.monthly_savings)}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {selected.status === "pending" && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", py: 1 }}>
                  {[{ label: "Submitted", stage: 0 }, ...APPROVAL_STAGES.map((s) => ({ label: s.label, stage: s.stage }))].map(
                    (step) => {
                      const stage = selected.current_stage ?? 1;
                      const done = step.stage === 0 || step.stage < stage;
                      const current = step.stage === stage;
                      return (
                        <Chip
                          key={step.label}
                          label={step.label}
                          size="small"
                          color={current ? "warning" : done ? "success" : "default"}
                          variant={current ? "filled" : "outlined"}
                        />
                      );
                    }
                  )}
                </Box>
              )}

              {selected.status === "pending" && !needsMyAction(selected) && (
                <Alert severity="info">
                  This application is waiting for {labelForRole(STAGE_ROLE_MAP[selected.current_stage ?? 1] ?? "next reviewer")}.
                </Alert>
              )}

              {selected.approval_actions?.length ? (
                <Box>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, mb: 1 }}>Approval history</Typography>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {selected.approval_actions.map((action) => (
                      <Paper key={`${action.stage}-${action.actioned_at}`} sx={{ p: 2, bgcolor: "rgba(248,250,252,0.9)", border: "1px solid rgba(203,213,225,0.5)" }}>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>Stage {action.stage}</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>Role: {action.required_role.replace("_", " ")}</Typography>
                        <Typography sx={{ mt: 1, fontSize: "0.875rem" }}>
                          <strong>{action.action.toUpperCase()}</strong> – {action.notes || "No note provided."}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 1 }}>{formatDate(action.actioned_at, "dd MMM yyyy, HH:mm")}</Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                  No approval history recorded yet.
                </Typography>
              )}

              {selected.status === "pending" && (
                <TextField
                  label="Add approval notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} variant="outlined" size="small">Close</Button>
          {selected?.status === "pending" && needsMyAction(selected) && (
            <>
              <Button
                onClick={() => handleAction(selected.id, "rejected")}
                color="error"
                variant="outlined"
                size="small"
                disabled={actionLoading}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleAction(selected.id, "approved")}
                variant="contained"
                size="small"
                disabled={actionLoading}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
