"use client";

import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { useRouter } from "next/navigation";
import { DollarSign, Calendar, Percent, AlertCircle, CheckCircle, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency, formatInterestRate, calculateMonthlyRepayment, calculateTotalRepayable } from "@/utils/formatters";

interface LoanProduct {
  id: string;
  name: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  max_term_months: number;
}

interface LoanApplicationProps {
  loanProducts: LoanProduct[];
}

export function LoanApplication({ loanProducts }: LoanApplicationProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(loanProducts[0]?.id ?? "");
  const [principal, setPrincipal] = useState(5000);
  const [duration, setDuration] = useState(12);
  const [purpose, setPurpose] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => loanProducts.find((product) => product.id === productId) ?? loanProducts[0],
    [loanProducts, productId]
  );

  const monthlyRepayment = useMemo(() => {
    if (!selectedProduct || duration <= 0) return 0;
    return calculateMonthlyRepayment(principal, selectedProduct.interest_rate, duration);
  }, [principal, selectedProduct, duration]);

  const totalRepayable = useMemo(
    () => calculateTotalRepayable(principal, selectedProduct?.interest_rate ?? 0, duration),
    [principal, selectedProduct, duration]
  );

  const interestAmount = useMemo(() => totalRepayable - principal, [totalRepayable, principal]);

  const firstRepaymentDate = useMemo(() => format(addMonths(new Date(), 1), "dd MMM yyyy"), []);
  const expectedCompletionDate = useMemo(() => format(addMonths(new Date(), duration), "dd MMM yyyy"), [duration]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/loans/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_product_id: productId,
          principal,
          duration_months: duration,
          purpose: purpose.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit loan request.");
      }

      setSuccessMessage("Loan application submitted successfully. It will now enter the approval workflow.");
      setConfirmOpen(false);
      setLoading(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Submission failed.");
      setLoading(false);
    }
  };

  if (loanProducts.length === 0) {
    return (
      <GlassCard className="p-6 mb-6">
        <h3 className="text-lg font-bold text-brand-text mb-2">Loan application unavailable</h3>
        <p className="text-brand-text-secondary text-sm">
          There are no active loan products configured. Please contact your administrator.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard id="loan-application" className="p-6 mb-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-brand-text mb-2">Apply for a Loan</h3>
          <p className="text-brand-text-secondary text-sm">
            Submit a new loan request and track progress through Union Rep, Fund Manager, and Chairperson review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">Loan Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            >
              {loanProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">Principal Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                min={selectedProduct.min_amount}
                max={selectedProduct.max_amount}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">Duration (months)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={selectedProduct.max_term_months}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text mb-2">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            placeholder="Brief description of the loan purpose"
            className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
          />
        </div>

        <div className="bg-brand-hover/30 border border-brand-card-border rounded-lg p-4">
          <h4 className="text-lg font-semibold text-brand-text mb-4">Loan Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Requested Amount", value: formatCurrency(principal), icon: DollarSign },
              { label: "Interest Rate", value: formatInterestRate(selectedProduct.interest_rate), icon: Percent },
              { label: "Interest Amount", value: formatCurrency(interestAmount), icon: DollarSign },
              { label: "Total Repayment", value: formatCurrency(totalRepayable), icon: DollarSign },
              { label: "Monthly Repayment", value: formatCurrency(monthlyRepayment), icon: DollarSign },
              { label: "First Repayment", value: firstRepaymentDate, icon: Calendar },
              { label: "Completion Date", value: expectedCompletionDate, icon: Calendar },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs text-brand-text-secondary">{item.label}</p>
                <p className="text-sm font-bold text-brand-text">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={principal <= 0 || duration <= 0 || !selectedProduct}
            className="px-6 py-2.5 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Review & Submit
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-brand-text mb-4">Confirm Loan Application</h3>
            <p className="text-brand-text-secondary text-sm mb-4">
              Are you sure you want to apply for this loan? Once confirmed, the request will enter the approval workflow and be reviewed by the Union Representative first.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Product:</span>
                <span className="font-semibold text-brand-text">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Amount:</span>
                <span className="font-semibold text-brand-text">{formatCurrency(principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Duration:</span>
                <span className="font-semibold text-brand-text">{duration} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Monthly Repayment:</span>
                <span className="font-semibold text-brand-text">{formatCurrency(monthlyRepayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Total Repayment:</span>
                <span className="font-semibold text-brand-text">{formatCurrency(totalRepayable)}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 border border-brand-card-border text-brand-text rounded-lg hover:bg-brand-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 transition-all"
              >
                {loading ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 max-w-md">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </GlassCard>
  );
}
