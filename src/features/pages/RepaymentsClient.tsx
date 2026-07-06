"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BadgeCent, Plus } from "lucide-react";

export function RepaymentsClient({
  repayments,
  loans,
}: {
  repayments: any[];
  loans: any[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLoan = loans.find((l) => l.id === loanId);
  const outstanding = Number(selectedLoan?.outstanding_balance) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId || !amount) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/repayments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_id: loanId,
          amount: Number(amount),
          payment_method: paymentMethod,
          notes: notes || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to record repayment");
      }
      setShowForm(false);
      setLoanId("");
      setAmount("");
      setPaymentMethod("cash");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record repayment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Record Repayment"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-lg bg-brand-card-bg border border-brand-border space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-text-secondary mb-1">
                Loan
              </label>
              <select
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                required
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="">Select a loan</option>
                {loans.map((loan) => {
                  const name = `${loan.employees?.first_name ?? ""} ${loan.employees?.last_name ?? ""}`.trim();
                  return (
                    <option key={loan.id} value={loan.id}>
                      {loan.loan_ref} · {name || "Unknown"} · {formatCurrency(loan.outstanding_balance)} outstanding
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text-secondary mb-1">
                Amount (max {formatCurrency(outstanding)})
              </label>
              <input
                type="number"
                min={0.01}
                max={outstanding || undefined}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text-secondary mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cheque">Cheque</option>
                <option value="payroll_deduction">Payroll Deduction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text-secondary mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note"
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-brand-text-secondary hover:bg-brand-bg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !loanId || !amount}
              className="px-4 py-2 rounded-lg bg-brand-success text-white text-sm font-medium hover:bg-brand-success/90 disabled:opacity-50 transition-all"
            >
              {loading ? "Processing..." : "Record Repayment"}
            </button>
          </div>
        </form>
      )}

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
                <BadgeCent className="h-5 w-5 text-brand-success" />
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
    </div>
  );
}
