"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import SearchableList from "@/components/data/SearchableList";
import {
  formatCurrency,
  formatDate,
  generateAmortizationSchedule,
  calculateTotalRepayable,
  calculateMonthlyRepayment,
  feedbackDeadline,
} from "@/utils/formatters";
import { REJECTION_REASON_CODES } from "@/utils/constants";
import { CheckCircle, Clock, BadgeCent, Calendar, X, Users, Shield, Pencil } from "lucide-react";

export function MyLoansClient({
  pending,
  active,
  totalBorrowed,
  netAvailable,
  savingsBalance,
  activeLoanBalance,
  loans,
  loanProducts = [],
}: {
  pending: number;
  active: number;
  totalBorrowed: number;
  netAvailable: number;
  savingsBalance: number;
  activeLoanBalance: number;
  loans: any[];
  loanProducts?: any[];
}) {
  const router = useRouter();
  const [productFilter, setProductFilter] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [editingLoan, setEditingLoan] = useState<any | null>(null);
  const [amendProductId, setAmendProductId] = useState("");
  const [amendAmount, setAmendAmount] = useState("");
  const [amendTerm, setAmendTerm] = useState("");
  const [amendPurpose, setAmendPurpose] = useState("");
  const [amendLoading, setAmendLoading] = useState(false);
  const [amendError, setAmendError] = useState<string | null>(null);

  const canAmend = (status: string) => status === "pending" || status === "rejected";

  const selectedAmendProduct = useMemo(
    () => loanProducts.find((p) => p.id === amendProductId),
    [loanProducts, amendProductId]
  );

  const openAmend = (loan: any) => {
    setEditingLoan(loan);
    setAmendProductId(loan.loan_product_id || "");
    setAmendAmount(loan.amount_requested ? String(loan.amount_requested) : "");
    setAmendTerm(loan.term_months ? String(loan.term_months) : "");
    setAmendPurpose(loan.purpose || "");
    setAmendError(null);
  };

  const closeAmend = () => {
    setEditingLoan(null);
    setAmendProductId("");
    setAmendAmount("");
    setAmendTerm("");
    setAmendPurpose("");
    setAmendError(null);
  };

  const handleAmend = async () => {
    if (!editingLoan) return;
    setAmendLoading(true);
    setAmendError(null);
    try {
      const response = await fetch("/api/loans/amend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_id: editingLoan.id,
          loan_product_id: amendProductId,
          amount_requested: Number(amendAmount),
          term_months: Number(amendTerm),
          purpose: amendPurpose,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to amend application.");
      }
      closeAmend();
      router.refresh();
    } catch (err) {
      setAmendError(err instanceof Error ? err.message : "Unexpected error.");
    }
    setAmendLoading(false);
  };

  const products = useMemo(
    () => Array.from(new Set(loans.map((l) => l.loan_products?.name ?? "").filter(Boolean))),
    [loans]
  );

  const filteredLoans = useMemo(() => {
    if (!productFilter) return loans;
    return loans.filter((l) => l.loan_products?.name === productFilter);
  }, [loans, productFilter]);

  const getLoanAmount = (loan: any) =>
    Number(loan.amount_disbursed) || Number(loan.amount_approved) || Number(loan.amount_requested) || 0;

  const getOutstanding = (loan: any) => {
    if (loan.status === "pending") return "—";
    const balance =
      Number(loan.outstanding_balance) || Number(loan.amount_disbursed) || Number(loan.amount_approved) || 0;
    return formatCurrency(balance);
  };

  const getFeedbackDate = (loan: any) => {
    if (loan.status !== "pending") return null;
    return `Feedback by ${feedbackDeadline(loan.created_at)}`;
  };

  return (
    <>
      <SearchableList
        title="My Loans"
        subtitle="View your loan applications and status"
        searchPlaceholder="Search loans..."
        emptyMessage="No loan applications found."
        actions={
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="">All products</option>
            {products.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        }
        stats={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Clock} label="Pending" value={String(pending)} color="text-brand-warning" />
            <StatCard icon={CheckCircle} label="Active" value={String(active)} color="text-brand-success" />
            <StatCard icon={BadgeCent} label="Total Borrowed" value={formatCurrency(totalBorrowed)} color="text-brand-accent" />
            <StatCard icon={BadgeCent} label="Net Available" value={formatCurrency(netAvailable)} color="text-brand-green" />
          </div>
        }
        items={filteredLoans.map((loan) => {
          const amount = getLoanAmount(loan);
          const totalInterest =
            calculateTotalRepayable(amount, Number(loan.interest_rate) || 0, Number(loan.term_months) || 0, loan.interest_calc_method || "reducing_balance") - amount;
          const feedbackDate = getFeedbackDate(loan);
          const guarantor = loan.guarantor;
          return {
            id: loan.id,
            searchText: `${loan.loan_ref} ${loan.loan_products?.name ?? ""} ${loan.purpose ?? ""} ${loan.status} ${loan.guarantor?.first_name ?? ""}`,
            content: (
              <div className="rounded-lg bg-brand-card-bg p-4">
                <div className="flex items-start gap-4">
                  <BadgeCent className="mt-0.5 h-5 w-5 text-brand-accent" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-brand-text">{loan.loan_ref}</p>
                        <p className="text-xs font-medium text-brand-accent">{loan.loan_products?.name ?? "Facility"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {feedbackDate && (
                          <span className="rounded-full bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-brand-accent">
                            {feedbackDate}
                          </span>
                        )}
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold capitalize text-brand-text-secondary">
                          {loan.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <LoanDetail label="Facility Amount" value={formatCurrency(amount)} />
                      <LoanDetail label="Monthly Payment" value={formatCurrency(loan.monthly_repayment || 0)} highlight />
                      <LoanDetail label="Outstanding Balance" value={getOutstanding(loan)} />
                      <LoanDetail label="Total Interest" value={formatCurrency(totalInterest)} />
                    </div>

                    {loan.status === "rejected" && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                        <p className="font-semibold">This application was rejected</p>
                        <p className="mt-1">You can amend the application and resubmit it for review.</p>
                      </div>
                    )}
                    {(guarantor || (loan.loan_guarantors && loan.loan_guarantors.length > 0)) && (
                      <div className="mt-3 space-y-2 rounded-lg border border-brand-card-border bg-white/50 px-3 py-2 text-xs text-brand-text-secondary">
                        {guarantor && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-brand-accent" />
                            <span className="font-medium">Guarantor 1:</span>
                            <span className="text-brand-text">
                              {guarantor.first_name} {guarantor.last_name} ({guarantor.employee_no})
                            </span>
                          </div>
                        )}
                        {(loan.loan_guarantors ?? []).map((entry: any, index: number) =>
                          entry.guarantor ? (
                            <div key={entry.id ?? index} className="flex flex-wrap items-center gap-2">
                              <Shield className="h-3.5 w-3.5 text-brand-accent" />
                              <span className="font-medium">Guarantor {index + 2}:</span>
                              <span className="text-brand-text">
                                {entry.guarantor.first_name} {entry.guarantor.last_name} ({entry.guarantor.employee_no})
                              </span>
                              {entry.account_number && <span>· Ac/No: {entry.account_number}</span>}
                              {entry.amount !== null && entry.amount !== undefined && (
                                <span>· Approved: {formatCurrency(Number(entry.amount))}</span>
                              )}
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex justify-end gap-2">
                      {canAmend(loan.status) && (
                        <button
                          onClick={() => openAmend(loan)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 border border-amber-200"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Amend
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedLoan(loan)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-card-bg px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-hover border border-brand-card-border"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        View Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ),
          };
        })}
      />

      {selectedLoan && (
        <AmortizationModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
      )}

      {editingLoan && (
        <AmendModal
          loanProducts={loanProducts}
          productId={amendProductId}
          setProductId={setAmendProductId}
          amount={amendAmount}
          setAmount={setAmendAmount}
          term={amendTerm}
          setTerm={setAmendTerm}
          purpose={amendPurpose}
          setPurpose={setAmendPurpose}
          error={amendError}
          loading={amendLoading}
          onSave={handleAmend}
          onClose={closeAmend}
        />
      )}
    </>
  );
}

function AmendModal({
  loanProducts,
  productId,
  setProductId,
  amount,
  setAmount,
  term,
  setTerm,
  purpose,
  setPurpose,
  error,
  loading,
  onSave,
  onClose,
}: {
  loanProducts: any[];
  productId: string;
  setProductId: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  term: string;
  setTerm: (v: string) => void;
  purpose: string;
  setPurpose: (v: string) => void;
  error: string | null;
  loading: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const selectedProduct = useMemo(() => loanProducts.find((p) => p.id === productId), [loanProducts, productId]);
  const estimatedMonthly = useMemo(() => {
    const principal = Number(amount) || 0;
    const months = Number(term) || 0;
    if (!selectedProduct || !principal || !months) return 0;
    return calculateMonthlyRepayment(principal, Number(selectedProduct.interest_rate), months, selectedProduct.interest_calc_method || "reducing_balance");
  }, [amount, term, selectedProduct]);
  const estimatedInterest = useMemo(() => estimatedMonthly * (Number(term) || 0) - (Number(amount) || 0), [estimatedMonthly, term, amount]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-brand bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-brand-card-border px-6 py-4">
          <h2 className="text-lg font-bold text-brand-text">Amend Facility Application</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-brand-hover"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col gap-4 p-6">
          {error && (
            <div className="rounded-brand border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-brand border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            >
              {loanProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">Amount Requested</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-brand border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">Term (months)</label>
            <input
              type="number"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full rounded-brand border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              placeholder="Enter term in months"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-text">Purpose</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              className="w-full rounded-brand border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              placeholder="Reason for the facility"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-brand border border-brand-card-border bg-brand-background p-3">
            <div>
              <span className="text-xs text-brand-text-secondary">Est. Monthly Payment</span>
              <p className="text-sm font-semibold text-brand-text">{formatCurrency(estimatedMonthly)}</p>
            </div>
            <div>
              <span className="text-xs text-brand-text-secondary">Est. Total Interest</span>
              <p className="text-sm font-semibold text-brand-text">{formatCurrency(estimatedInterest)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-brand-card-border px-6 py-4">
          <button onClick={onClose} className="rounded-brand border border-brand-card-border px-4 py-2 text-sm font-medium text-brand-text-secondary hover:bg-brand-hover">Cancel</button>
          <button
            onClick={onSave}
            disabled={loading || !productId || !amount || !term}
            className="rounded-brand bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanDetail({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-lg bg-brand-green/10 p-2" : "p-2"}>
      <p className="text-xs text-brand-text-secondary">{label}</p>
      <p className={`mt-1 text-sm font-bold ${highlight ? "text-brand-green" : "text-brand-text"}`}>{value}</p>
    </div>
  );
}

function AmortizationModal({ loan, onClose }: { loan: any; onClose: () => void }) {
  const schedule = useMemo(() => {
    const principal = Number(loan.amount_disbursed) || Number(loan.amount_approved) || Number(loan.amount_requested) || 0;
    return generateAmortizationSchedule(
      principal,
      Number(loan.term_months) || 0,
      Number(loan.interest_rate) * 100,
      loan.disbursement_date ? new Date(loan.disbursement_date) : new Date(),
      loan.interest_calc_method || "reducing_balance"
    );
  }, [loan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-brand bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-brand-card-border px-6 py-4">
          <h2 className="text-lg font-bold text-brand-text">Amortization Schedule</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-brand-hover"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="grid grid-cols-3 gap-4 rounded-brand border border-brand-card-border bg-brand-background p-4">
            {[
              { label: "Facility Amount", value: formatCurrency(Number(loan.amount_disbursed) || Number(loan.amount_approved) || Number(loan.amount_requested) || 0) },
              { label: "Interest Rate", value: `${Number(loan.interest_rate) || 0}%` },
              { label: "Term", value: `${Number(loan.term_months) || 0} months` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-brand-text-secondary">{label}</p>
                <p className="text-sm font-semibold text-brand-text">{value}</p>
              </div>
            ))}
          </div>
          <div className="overflow-auto rounded-brand border border-brand-card-border">
            <table className="w-full text-sm">
              <thead className="border-b border-brand-card-border bg-brand-background">
                <tr>
                  {["Month", "Principal", "Interest", "Total", "Balance"].map((h) => (
                    <th key={h} className="px-3 py-2 text-right text-xs font-semibold uppercase text-brand-text-secondary first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-card-border">
                {schedule.map((payment, index) => (
                  <tr key={index} className="hover:bg-brand-hover/50">
                    <td className="px-3 py-2 text-brand-text">{payment.month}</td>
                    <td className="px-3 py-2 text-right text-brand-text-secondary">{formatCurrency(payment.principal)}</td>
                    <td className="px-3 py-2 text-right text-brand-text-secondary">{formatCurrency(payment.interest)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-brand-text">{formatCurrency(payment.total)}</td>
                    <td className="px-3 py-2 text-right text-brand-text-secondary">{formatCurrency(payment.closing_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end border-t border-brand-card-border px-6 py-4">
          <button onClick={onClose} className="rounded-brand border border-brand-card-border px-4 py-2 text-sm font-medium text-brand-text-secondary hover:bg-brand-hover">Close</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <GlassCard className="p-6">
      <div className="mb-2 flex items-center gap-3">
        <div className={`rounded-lg bg-brand-card-bg p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-brand-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
    </GlassCard>
  );
}
