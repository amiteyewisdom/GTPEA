"use client";

import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { DollarSign } from "lucide-react";

export function RepaymentsClient({ repayments }: { repayments: any[] }) {
  return (
    <SearchableList
      title="Repayments"
      subtitle="Track loan repayments"
      searchPlaceholder="Search repayments..."
      emptyMessage="No repayments recorded."
      items={repayments.map((item) => {
        const name = `${item.employees?.first_name ?? ""} ${item.employees?.last_name ?? ""}`.trim();
        return {
          id: item.id,
          searchText: `${name} ${item.loans?.loan_ref ?? ""} ${item.status}`,
          content: (
            <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
              <DollarSign className="h-5 w-5 text-brand-success" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-text">
                  {name || "Unknown"} · {item.loans?.loan_ref ?? "Loan"}
                </p>
                <p className="text-xs text-brand-text-secondary">
                  Due {formatCurrency(item.amount_due)} · Paid {formatCurrency(item.amount_paid)} · {item.status}
                </p>
              </div>
              <p className="text-xs text-brand-text-secondary">{formatDate(item.due_date)}</p>
            </div>
          ),
        };
      })}
    />
  );
}
