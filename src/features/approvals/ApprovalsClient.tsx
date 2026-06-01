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
import { formatDate, formatRelativeTime } from "@/utils/formatters";
import { createClient } from "@/lib/supabase/client";

interface ApprovalRow {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  submitted_by: string;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  profiles?: { full_name: string } | null;
  reviewer?: { full_name: string } | null;
}

interface ApprovalsClientProps {
  approvals: ApprovalRow[];
  total: number;
}

export function ApprovalsClient({ approvals, total }: ApprovalsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<ApprovalRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const pending = approvals.filter((a) => a.status === "pending").length;
  const approved = approvals.filter((a) => a.status === "approved").length;
  const rejected = approvals.filter((a) => a.status === "rejected").length;

  const filtered = approvals.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.entity_type.toLowerCase().includes(q) ||
      (a.profiles?.full_name?.toLowerCase().includes(q) ?? false) ||
      a.id.toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleAction = async (approvalId: string, action: "approved" | "rejected") => {
    setActionLoading(true);
    setActionError(null);
    const supabase = createClient() as any;
    const { error } = await supabase
      .from("approvals")
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq("id", approvalId);

    if (error) {
      setActionError(error.message);
    } else {
      setSelected(null);
      router.refresh();
    }
    setActionLoading(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* KPIs */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        <KPICard title="Pending Review" value={pending} icon={PendingActionsRounded} accent={pending > 5 ? "warning" : "primary"} subtitle="Awaiting action" />
        <KPICard title="Approved" value={approved} icon={CheckCircleRounded} accent="success" subtitle="This period" />
        <KPICard title="Rejected" value={rejected} icon={CancelRounded} accent="danger" subtitle="This period" />
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

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Type</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Submitted By</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', md: 'table-cell' } }}>Submitted</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', lg: 'table-cell' } }}>Reviewed By</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', display: { xs: 'none', lg: 'table-cell' } }}>Reviewed</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>Status</TableCell>
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
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', md: 'table-cell' } }}>
                    <Tooltip title={formatDate(approval.submitted_at, "dd MMM yyyy HH:mm")}>
                      <span>{formatRelativeTime(approval.submitted_at)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', lg: 'table-cell' } }}>
                    {approval.reviewer?.full_name ?? "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary", display: { xs: 'none', lg: 'table-cell' } }}>
                    {approval.reviewed_at ? formatRelativeTime(approval.reviewed_at) : "—"}
                  </TableCell>
                  <TableCell><StatusChip status={approval.status} /></TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      {approval.status === "pending" && (
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {actionError && <Alert severity="error">{actionError}</Alert>}
              {[
                { label: "Type", value: selected.entity_type.replace("_", " ") },
                { label: "Reference ID", value: selected.entity_id },
                { label: "Submitted By", value: selected.profiles?.full_name ?? "—" },
                { label: "Submitted At", value: formatDate(selected.submitted_at, "dd MMM yyyy, HH:mm") },
                { label: "Status", value: <StatusChip status={selected.status} /> },
                ...(selected.review_notes ? [{ label: "Review Notes", value: selected.review_notes }] : []),
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", fontWeight: 500 }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} variant="outlined" size="small">Close</Button>
          {selected?.status === "pending" && (
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
