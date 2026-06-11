"use client";

import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { DollarSign } from "lucide-react";

export function DisbursementsClient({ disbursements }: { disbursements: any[] }) {
  return (
    <SearchableList
      title="Disbursements"
      subtitle="Manage loan disbursements"
      searchPlaceholder="Search disbursements..."
      emptyMessage="No disbursements recorded."
      items={disbursements.map((item) => {
        const name = `${item.employees?.first_name ?? ""} ${item.employees?.last_name ?? ""}`.trim();
        return {
          id: item.id,
          searchText: `${name} ${item.loan_ref} ${item.loan_products?.name ?? ""}`,
          content: (
            <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
              <DollarSign className="h-5 w-5 text-brand-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-text">
                  {item.loan_ref} · {name || "Unknown"}
                </p>
                <p className="text-xs text-brand-text-secondary">
                  {formatCurrency(item.amount_disbursed)} · {item.loan_products?.name ?? "Loan"} · {item.status}
                </p>
              </div>
              <p className="text-xs text-brand-text-secondary">
                {item.disbursement_date ? formatDate(item.disbursement_date) : "—"}
              </p>
            </div>
          ),
        };
      })}
    />
  );
}
