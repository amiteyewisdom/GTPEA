"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BadgeCent, CheckCircle } from "lucide-react";

export function DisbursementsClient({ disbursements }: { disbursements: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDisburse = async (item: any) => {
    setLoadingId(item.id);
    setError(null);
    try {
      const isWithdrawal = item.kind === "withdrawal";
      const response = await fetch(isWithdrawal ? "/api/withdrawals/disburse" : "/api/loans/disburse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isWithdrawal ? { withdrawal_id: item.id } : { loan_id: item.id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Disbursement failed");
      }
      toast.success(isWithdrawal ? "Withdrawal paid out" : "Loan recorded as disbursed", {
        description: isWithdrawal
          ? "The amount has been deducted from the member's savings."
          : "The loan is now repaying — repayments will be recovered through payroll.",
      });
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Disbursement failed";
      setError(msg);
      toast.error("Disbursement failed", { description: msg });
    } finally {
      setLoadingId(null);
    }
  };

  const isDisbursed = (item: any) =>
    item.status === "disbursed" ||
    item.status === "repaying" ||
    item.status === "completed" ||
    Number(item.amount_disbursed) > 0;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}
      <SearchableList
        title="Disbursements"
        subtitle="Manage loan and savings disbursements"
        searchPlaceholder="Search disbursements..."
        emptyMessage="Nothing awaiting disbursement."
        items={disbursements.map((item) => {
          const isWithdrawal = item.kind === "withdrawal";
          const name = `${item.employees?.first_name ?? ""} ${item.employees?.last_name ?? ""}`.trim();
          const disbursed = isWithdrawal ? item.status === "disbursed" : isDisbursed(item);
          const amount = isWithdrawal
            ? Number(item.amount)
            : disbursed
              ? Number(item.amount_disbursed)
              : Number(item.amount_approved) || Number(item.amount_requested) || 0;
          const ref = isWithdrawal ? item.request_ref : item.loan_ref;
          const label = isWithdrawal ? `Savings PW · ${item.savings?.type ?? "savings"}` : item.loan_products?.name ?? "Loan";

          return {
            id: item.id,
            searchText: `${name} ${ref} ${label}`,
            content: (
              <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
                <BadgeCent className="h-5 w-5 text-brand-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-text">
                    {ref} · {name || "Unknown"}
                  </p>
                  <p className="text-xs text-brand-text-secondary">
                    {formatCurrency(amount)} · {label} · {item.status}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {disbursed ? (
                    <span className="text-xs font-medium text-brand-success inline-flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Disbursed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDisburse(item)}
                      disabled={loadingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-brand-success/20 text-brand-success text-xs font-medium hover:bg-brand-success/30 disabled:opacity-50 transition-all"
                    >
                      {loadingId === item.id ? "Processing..." : isWithdrawal ? "Disburse Savings" : "Disburse"}
                    </button>
                  )}
                  <p className="text-xs text-brand-text-secondary">
                    {item.disbursement_date ? formatDate(item.disbursement_date) : "—"}
                  </p>
                </div>
              </div>
            ),
          };
        })}
      />
    </div>
  );
}
