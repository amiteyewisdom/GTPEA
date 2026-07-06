"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BadgeCent, CheckCircle } from "lucide-react";

export function DisbursementsClient({ disbursements }: { disbursements: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDisburse = async (loanId: string) => {
    setLoadingId(loanId);
    setError(null);
    try {
      const response = await fetch("/api/loans/disburse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loan_id: loanId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Disbursement failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disbursement failed");
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
        subtitle="Manage loan disbursements"
        searchPlaceholder="Search disbursements..."
        emptyMessage="No loans awaiting disbursement."
        items={disbursements.map((item) => {
          const name = `${item.employees?.first_name ?? ""} ${item.employees?.last_name ?? ""}`.trim();
          const disbursed = isDisbursed(item);
          const amount = disbursed
            ? Number(item.amount_disbursed)
            : Number(item.amount_approved) || Number(item.amount_requested) || 0;

          return {
            id: item.id,
            searchText: `${name} ${item.loan_ref} ${item.loan_products?.name ?? ""}`,
            content: (
              <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
                <BadgeCent className="h-5 w-5 text-brand-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-text">
                    {item.loan_ref} · {name || "Unknown"}
                  </p>
                  <p className="text-xs text-brand-text-secondary">
                    {formatCurrency(amount)} · {item.loan_products?.name ?? "Loan"} · {item.status}
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
                      onClick={() => handleDisburse(item.id)}
                      disabled={loadingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-brand-success/20 text-brand-success text-xs font-medium hover:bg-brand-success/30 disabled:opacity-50 transition-all"
                    >
                      {loadingId === item.id ? "Processing..." : "Disburse"}
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
