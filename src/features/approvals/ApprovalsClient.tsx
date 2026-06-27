"use client";

import { useState } from "react";
import { Search, Check, X, ExternalLink, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import { KPICard } from "@/components/ui/KPICard";
import { useRouter } from "next/navigation";
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
    interest_calc_method?: string | null;
    product_name?: string | null;
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
  const isApproverRole = ["union_rep", "fund_manager", "chairperson"].includes(userRole);
  const [view, setView] = useState<"action" | "all">(isApproverRole ? "action" : "all");

  const STAGE_ROLE_MAP: Record<number, string> = Object.fromEntries(
    APPROVAL_STAGES.map((s) => [s.stage, s.role])
  );

  const needsMyAction = (approval: ApprovalRow) => {
    if (approval.status !== "pending") return false;
    if (!canApproveAtStage(userRole, approval.current_stage ?? 1)) return false;
    // Check if this stage already has an action recorded (someone already approved/rejected)
    const actions = approval.approval_actions ?? [];
    const stageAlreadyActioned = actions.some((a) => a.stage === (approval.current_stage ?? 1));
    return !stageAlreadyActioned;
  };

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

    // ALL RELEVANT: approvers see all pending/in-pipeline approvals; employees see only their own
    const isApprover = ["union_rep", "fund_manager", "chairperson"].includes(userRole);
    if (isApprover) {
      return matchesSearch;
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
      console.log("[handleAction] response payload:", payload);
      if (!response.ok) {
        throw new Error(payload?.error || payload?.details?.message || "Unable to process approval action.");
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
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Loan Approvals</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">Review and action loan applications in the approval pipeline.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isApproverRole
          ? <KPICard title="Needs My Action" value={myActionCount} icon={Clock} accent={myActionCount > 0 ? "warning" : "primary"} subtitle="Ready for your review" />
          : <KPICard title="All Approvals" value={approvals.length} icon={Clock} accent="primary" subtitle="In the system" />
        }
        <KPICard title="Pending Review" value={pending} icon={Clock} accent="primary" subtitle="All pending" />
        <KPICard title="Approved" value={approved} icon={CheckCircle} accent="success" subtitle="This period" />
        <KPICard title="Rejected" value={rejected} icon={XCircle} accent="danger" subtitle="This period" />
      </div>

      {/* View toggle + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {isApproverRole && (
            <button
              onClick={() => { setView("action"); setPage(0); }}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${view === "action" ? "bg-brand-green text-white" : "border border-brand-card-border bg-white text-brand-text-secondary hover:bg-brand-hover"}`}
            >
              Needs My Action ({myActionCount})
            </button>
          )}
          <button
            onClick={() => { setView("all"); setPage(0); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${view === "all" ? "bg-brand-green text-white" : "border border-brand-card-border bg-white text-brand-text-secondary hover:bg-brand-hover"}`}
          >
            {isApproverRole ? "All Relevant" : "All Approvals"}
          </button>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search approvals…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-brand border border-brand-card-border bg-white py-2 pl-9 pr-3 text-sm text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-brand border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-brand border border-brand-card-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-card-border bg-brand-background">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Submitted By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Stage</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary md:table-cell">Submitted</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text-secondary lg:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-card-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-brand-text-secondary">
                    {search ? "No approvals match your search." : view === "action" ? "No approvals need your action right now." : "No approvals found."}
                  </td>
                </tr>
              ) : (
                paginated.map((approval) => (
                  <tr key={approval.id} className="hover:bg-brand-hover/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-cyan-700 ring-1 ring-cyan-200">
                        {approval.entity_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-text">
                      {approval.profiles?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-brand-text">{approval.current_stage ?? 1}/{approval.total_stages ?? 3}</span>
                      {(approval.current_stage ?? 1) < (approval.total_stages ?? 3) && (
                        <p className="text-xs text-brand-text-secondary">{labelForStage(approval.current_stage ?? 1)}</p>
                      )}
                      {approval.status === "pending" && needsMyAction(approval) && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">Your turn</span>
                      )}
                      {approval.status === "pending" && !needsMyAction(approval) && (
                        <p className="mt-1 text-xs text-brand-text-secondary">Waiting for {labelForStage(approval.current_stage ?? 1)}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-brand-text-secondary md:table-cell">
                      <span title={formatDate(approval.submitted_at, "dd MMM yyyy HH:mm")}>{formatRelativeTime(approval.submitted_at)}</span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <StatusChip status={approval.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {approval.status === "pending" && canApproveAtStage(userRole, approval.current_stage ?? 1) && (
                          <>
                            <button
                              title="Approve"
                              onClick={() => handleAction(approval.id, "approved")}
                              className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              title="Reject"
                              onClick={() => handleAction(approval.id, "rejected")}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          title="View details"
                          onClick={() => setSelected(approval)}
                          className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-brand-hover transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-brand-card-border px-4 py-3 text-sm text-brand-text-secondary">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              className="rounded border border-brand-card-border bg-white px-2 py-1 text-xs"
            >
              {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span>{filtered.length === 0 ? "0–0" : `${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, filtered.length)}`} of {filtered.length}</span>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded p-1 hover:bg-brand-hover disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * rowsPerPage >= filtered.length} className="rounded p-1 hover:bg-brand-hover disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-brand bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-card-border px-6 py-4">
              <h2 className="text-lg font-bold text-brand-text">Approval Details</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1 hover:bg-brand-hover"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex flex-col gap-5 px-6 py-5">
              {actionError && (
                <div className="flex items-center gap-2 rounded-brand border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <XCircle className="h-4 w-4 shrink-0" />{actionError}
                </div>
              )}

              {/* Basic info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Type", value: <span className="capitalize">{selected.entity_type.replace("_", " ")}</span> },
                  { label: "Stage", value: `${selected.current_stage ?? 1} / ${selected.total_stages ?? 3}` },
                  { label: "Submitted By", value: selected.profiles?.full_name ?? "—" },
                  { label: "Submitted At", value: formatDate(selected.submitted_at, "dd MMM yyyy, HH:mm") },
                  { label: "Status", value: <StatusChip status={selected.status} /> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-brand-text-secondary">{label}</span>
                    <span className="text-sm font-semibold text-brand-text">{value}</span>
                  </div>
                ))}
              </div>

              {/* Approval pipeline */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">Pipeline</p>
                <div className="flex flex-wrap gap-2">
                  {[{ label: "Submitted", stage: 0 }, ...APPROVAL_STAGES.map((s) => ({ label: s.label, stage: s.stage }))].map((step) => {
                    const stage = selected.current_stage ?? 1;
                    const done = step.stage === 0 || step.stage < stage;
                    const current = step.stage === stage && selected.status === "pending";
                    return (
                      <span key={step.label} className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        current ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" :
                        done ? "bg-green-100 text-green-700" : "bg-brand-background text-brand-text-secondary"
                      }`}>{step.label}</span>
                    );
                  })}
                </div>
              </div>

              {/* Loan details */}
              {selected.entity_type === "loan" && selected.loan_details && (
                <div className="rounded-brand border border-brand-card-border bg-brand-background p-4">
                  <p className="mb-3 text-sm font-bold text-brand-green">Loan Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Amount Requested", value: formatCurrency(selected.loan_details.amount_requested) },
                      { label: "Amount Approved", value: selected.loan_details.amount_approved ? formatCurrency(selected.loan_details.amount_approved) : "—" },
                      { label: "Monthly Repayment", value: formatCurrency(selected.loan_details.monthly_repayment) },
                      { label: "Term", value: `${selected.loan_details.term_months} months` },
                      { label: "Interest Rate", value: `${selected.loan_details.interest_rate}%` },
                      { label: "Calc. Method", value: selected.loan_details.interest_calc_method === "flat_rate" ? "Flat Rate" : "Reducing Balance" },
                      ...(selected.loan_details.product_name ? [{ label: "Product", value: selected.loan_details.product_name }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-brand-text-secondary">{label}</span>
                        <span className="text-sm font-semibold text-brand-text">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Withdrawal details */}
              {selected.entity_type === "withdrawal" && selected.withdrawal_details && (
                <div className="rounded-brand border border-brand-card-border bg-brand-background p-4">
                  <p className="mb-3 text-sm font-bold text-brand-green">Withdrawal Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-brand-text-secondary">Amount</span>
                      <span className="text-sm font-semibold text-brand-text">{formatCurrency(selected.withdrawal_details.amount)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-brand-text-secondary">Savings Balance</span>
                      <span className="text-sm font-semibold text-brand-text">{formatCurrency(selected.withdrawal_details.savings_balance)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Employee summary */}
              {selected.employee_details && (
                <div className="rounded-brand border border-green-100 bg-green-50 p-4">
                  <p className="mb-3 text-sm font-bold text-green-700">Employee Financial Summary</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Savings", value: formatCurrency(selected.employee_details.total_savings) },
                      { label: "Loan Balance", value: formatCurrency(selected.employee_details.total_loan_balance) },
                      { label: "Monthly Savings", value: formatCurrency(selected.employee_details.monthly_savings) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-green-600">{label}</span>
                        <span className="text-sm font-semibold text-green-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval history */}
              {selected.approval_actions?.length ? (
                <div>
                  <p className="mb-2 text-sm font-bold text-brand-text">Approval History</p>
                  <div className="flex flex-col gap-2">
                    {selected.approval_actions.map((action) => (
                      <div key={`${action.stage}-${action.actioned_at}`} className="rounded-brand border border-brand-card-border bg-brand-background p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-text">Stage {action.stage} — {action.required_role.replace(/_/g, " ")}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${action.action === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{action.action.toUpperCase()}</span>
                        </div>
                        {action.notes && <p className="mt-1 text-xs text-brand-text-secondary">{action.notes}</p>}
                        <p className="mt-1 text-xs text-brand-text-secondary">{formatDate(action.actioned_at, "dd MMM yyyy, HH:mm")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-brand-text-secondary">No approval history recorded yet.</p>
              )}

              {/* Waiting info */}
              {selected.status === "pending" && !needsMyAction(selected) && (
                <div className="rounded-brand border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  Waiting for <strong>{labelForRole(STAGE_ROLE_MAP[selected.current_stage ?? 1] ?? "next reviewer")}</strong> to review.
                </div>
              )}

              {/* Notes */}
              {selected.status === "pending" && needsMyAction(selected) && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-brand-text">Approval Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes (optional)…"
                    className="w-full rounded-brand border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 border-t border-brand-card-border px-6 py-4">
              <button onClick={() => setSelected(null)} className="rounded-brand border border-brand-card-border px-4 py-2 text-sm font-medium text-brand-text-secondary hover:bg-brand-hover">
                Close
              </button>
              {selected.status === "pending" && needsMyAction(selected) && (
                <>
                  <button
                    onClick={() => handleAction(selected.id, "rejected")}
                    disabled={actionLoading}
                    className="rounded-brand border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(selected.id, "approved")}
                    disabled={actionLoading}
                    className="rounded-brand bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-50"
                  >
                    {actionLoading ? "Processing…" : "Approve"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
