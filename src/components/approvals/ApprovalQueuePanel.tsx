"use client";

import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { useApprovalAction } from "@/hooks/use-approval-action";
import type { LoanApprovalQueueItem } from "@/lib/approvals/build-queue";
import { labelForStage } from "@/lib/loans/workflow";
import { CheckCircle, XCircle, ArrowRight, AlertCircle } from "lucide-react";

type ApprovalQueuePanelProps = {
  title: string;
  description: string;
  items: LoanApprovalQueueItem[];
  emptyText?: string;
};

export default function ApprovalQueuePanel({
  title,
  description,
  items,
  emptyText = "Nothing waiting for you right now.",
}: ApprovalQueuePanelProps) {
  const { act, loading, message, clearMessage } = useApprovalAction();

  return (
    <GlassCard className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-brand-text">{title}</h3>
          <p className="text-sm text-brand-text-secondary">{description}</p>
        </div>
        <Link
          href="/approvals"
          className="flex items-center gap-1 text-sm font-medium text-brand-accent hover:text-brand-accent/80"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {message && (
        <div
          className={`mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="flex-1">{message.text}</p>
          <button onClick={clearMessage} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-brand-text-secondary">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.approvalId}
              className="rounded-lg border border-brand-card-border bg-brand-card-bg p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-text">{item.applicant}</p>
                  <p className="text-sm text-brand-text-secondary">
                    {item.amount} · {item.duration} · {item.purpose}
                  </p>
                  <p className="mt-1 text-xs text-brand-accent">
                    Stage {item.currentStage}/{item.totalStages} · Your review ({labelForStage(item.currentStage)})
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={loading}
                    onClick={() => act(item.approvalId, "approved")}
                    className="flex items-center gap-1 rounded-lg bg-brand-success/20 px-3 py-2 text-sm font-medium text-brand-success hover:bg-brand-success/30 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => act(item.approvalId, "rejected")}
                    className="flex items-center gap-1 rounded-lg bg-brand-danger/20 px-3 py-2 text-sm font-medium text-brand-danger hover:bg-brand-danger/30 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
