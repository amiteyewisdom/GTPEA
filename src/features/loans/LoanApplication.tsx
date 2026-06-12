"use client";

import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { useRouter } from "next/navigation";
import { DollarSign, Calendar, Percent, AlertCircle, CheckCircle, X, ChevronDown, ChevronUp, Info } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import {
  formatCurrency,
  formatInterestRate,
  calculateMonthlyRepayment,
  calculateTotalRepayable,
  calculateTotalInterest,
  generateAmortizationSchedule,
} from "@/utils/formatters";

interface LoanProduct {
  id: string;
  name: string;
  interest_rate: number;
  interest_calc_method: "reducing_balance" | "flat_rate";
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  account_code?: string | null;
  description?: string | null;
}

interface LoanApplicationProps {
  loanProducts: LoanProduct[];
  maxBorrowable?: number;
  savingsBalance?: number;
  activeLoanBalance?: number;
}

function amountError(product: LoanProduct | undefined, amount: number) {
  if (!product || amount <= 0) return "Enter a valid loan amount.";
  if (amount < product.min_amount || amount > product.max_amount) {
    return `Amount must be between ${formatCurrency(product.min_amount)} and ${formatCurrency(product.max_amount)}.`;
  }
  return null;
}

function amountWarning(amount: number, maxBorrowable?: number) {
  if (maxBorrowable !== undefined && maxBorrowable > 0 && amount > maxBorrowable) {
    return `Amount exceeds your current borrowing limit of ${formatCurrency(maxBorrowable)}.`;
  }
  return null;
}

function termError(product: LoanProduct | undefined, months: number) {
  if (!product || months <= 0) return "Enter a valid loan term.";
  if (months < product.min_term_months || months > product.max_term_months) {
    return `Term must be between ${product.min_term_months} and ${product.max_term_months} months.`;
  }
  return null;
}

export function LoanApplication({ loanProducts, maxBorrowable, savingsBalance, activeLoanBalance }: LoanApplicationProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(loanProducts[0]?.id ?? "");
  const [principalStr, setPrincipalStr] = useState("");
  const [durationStr, setDurationStr] = useState("");
  const principal = principalStr === "" ? 0 : Number(principalStr);
  const duration = durationStr === "" ? 0 : Number(durationStr);
  const [purpose, setPurpose] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => loanProducts.find((p) => p.id === productId) ?? loanProducts[0],
    [loanProducts, productId]
  );

  const calcMethod = selectedProduct?.interest_calc_method ?? "reducing_balance";

  const monthlyRepayment = useMemo(() => {
    if (!selectedProduct || duration <= 0) return 0;
    return calculateMonthlyRepayment(principal, selectedProduct.interest_rate, duration, calcMethod);
  }, [principal, selectedProduct, duration, calcMethod]);

  const totalRepayable = useMemo(
    () => calculateTotalRepayable(principal, selectedProduct?.interest_rate ?? 0, duration, calcMethod),
    [principal, selectedProduct, duration, calcMethod]
  );

  const interestAmount = useMemo(
    () => calculateTotalInterest(principal, selectedProduct?.interest_rate ?? 0, duration, calcMethod),
    [principal, selectedProduct, duration, calcMethod]
  );

  const schedule = useMemo(() => {
    if (!selectedProduct || duration <= 0 || principal <= 0) return [];
    return generateAmortizationSchedule(principal, duration, selectedProduct.interest_rate * 100, new Date(), calcMethod);
  }, [principal, selectedProduct, duration, calcMethod]);

  const firstRepaymentDate = useMemo(() => format(addMonths(new Date(), 1), "dd MMM yyyy"), []);
  const expectedCompletionDate = useMemo(() => format(addMonths(new Date(), duration), "dd MMM yyyy"), [duration]);

  const amountValidation = amountError(selectedProduct, principal);
  const amountWarn = amountWarning(principal, maxBorrowable);
  const termValidation = termError(selectedProduct, duration);
  const formValid = !amountValidation && !termValidation && Boolean(selectedProduct) && principal > 0;

  const handleProductChange = (nextProductId: string) => {
    const product = loanProducts.find((item) => item.id === nextProductId);
    setProductId(nextProductId);
    if (product) {
      setPrincipalStr("");
      setDurationStr("");
    }
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!formValid) {
      setErrorMessage(amountValidation ?? termValidation ?? "Please fix the form errors.");
      return;
    }
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
      <GlassCard className="p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border border-amber-200 mb-4">
          <AlertCircle className="w-7 h-7 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-brand-text mb-2">No loan products available</h3>
        <p className="text-brand-text-secondary text-sm max-w-sm mx-auto">
          Loan products have not been configured yet. Please ask your administrator to run the setup script to add the GTPEA loan products.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard id="loan-application" className="p-6 mb-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-brand-text mb-1">Apply for a Loan</h3>
            <p className="text-brand-text-secondary text-sm">
              Submit a new loan request and track progress through Union Rep, Fund Manager, and Chairperson review.
            </p>
          </div>

          {/* How much can I borrow */}
          {maxBorrowable !== undefined && (
            <div className="bg-brand-green/10 border border-brand-green/30 rounded-lg p-3 min-w-[220px]">
              <p className="text-xs text-brand-text-secondary mb-1 font-medium">Maximum You Can Borrow</p>
              <p className="text-xl font-bold text-brand-green">{formatCurrency(maxBorrowable)}</p>
              {savingsBalance !== undefined && (
                <p className="text-xs text-brand-text-secondary mt-1">
                  Savings: {formatCurrency(savingsBalance)}
                  {activeLoanBalance !== undefined && activeLoanBalance > 0 && (
                    <> &nbsp;·&nbsp; Active Loans: {formatCurrency(activeLoanBalance)}</>
                  )}
                </p>
              )}
              <p className="text-xs text-brand-text-secondary/70 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Based on 3× savings minus active loan balances
              </p>
            </div>
          )}
        </div>

        {/* Loan Product Cards */}
        <div>
          <label className="block text-sm font-medium text-brand-text mb-3">Select Loan Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {loanProducts.map((product) => {
              const isSelected = productId === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductChange(product.id)}
                  className={`relative flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all focus:outline-none ${
                    isSelected
                      ? "border-brand-green bg-brand-green/5 shadow-sm"
                      : "border-brand-card-border bg-white hover:border-brand-green/40 hover:bg-brand-green/5"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <span className={`text-xs font-bold leading-tight ${isSelected ? "text-brand-green" : "text-brand-text"}`}>
                    {product.name}
                  </span>
                  <span className="text-xs text-brand-text-secondary">
                    {(product.interest_rate * 100).toFixed(1)}% p.m.
                  </span>
                  <span className={`mt-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    product.interest_calc_method === "flat_rate"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {product.interest_calc_method === "flat_rate" ? "Flat" : "Reducing"}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedProduct?.description && (
            <p className="mt-2 text-xs text-brand-text-secondary">{selectedProduct.description}</p>
          )}
          {selectedProduct?.account_code && (
            <p className="mt-1 text-xs text-brand-text-secondary/60">Account code: {selectedProduct.account_code}</p>
          )}
        </div>

        {/* Amount & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">Principal Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand-text-secondary">GH₵</span>
              <input
                type="text"
                inputMode="numeric"
                value={principalStr}
                placeholder={String(selectedProduct.min_amount)}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setPrincipalStr(val);
                  setErrorMessage(null);
                }}
                className="w-full pl-14 pr-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-brand-text-secondary">
              Allowed: {formatCurrency(selectedProduct.min_amount)} – {formatCurrency(selectedProduct.max_amount)}
            </p>
            {amountValidation && (
              <p className="mt-1 text-xs text-red-600">{amountValidation}</p>
            )}
            {!amountValidation && amountWarn && (
              <p className="mt-1 text-xs text-amber-600">⚠ {amountWarn}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-2">Duration (months)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
              <input
                type="text"
                inputMode="numeric"
                value={durationStr}
                placeholder={String(selectedProduct.min_term_months)}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setDurationStr(val);
                  setErrorMessage(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-brand-text-secondary">
              Allowed: {selectedProduct.min_term_months}–{selectedProduct.max_term_months} months
            </p>
            {termValidation && (
              <p className="mt-1 text-xs text-red-600">{termValidation}</p>
            )}
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

        {/* Loan Summary */}
        <div className="bg-brand-hover/30 border border-brand-card-border rounded-lg p-4">
          <h4 className="text-lg font-semibold text-brand-text mb-4">Loan Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Requested Amount", value: formatCurrency(principal), icon: DollarSign },
              { label: "Interest Rate", value: `${(selectedProduct.interest_rate * 100).toFixed(2)}% p.m.`, icon: Percent },
              { label: "Total Interest", value: formatCurrency(interestAmount), icon: DollarSign },
              { label: "Total Repayment", value: formatCurrency(totalRepayable), icon: DollarSign },
              { label: "Monthly Repayment", value: formatCurrency(monthlyRepayment), icon: DollarSign },
              { label: "First Repayment", value: firstRepaymentDate, icon: Calendar },
              { label: "Completion Date", value: expectedCompletionDate, icon: Calendar },
              { label: "Method", value: calcMethod === "flat_rate" ? "Flat Rate" : "Reducing Balance", icon: Percent },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs text-brand-text-secondary">{item.label}</p>
                <p className="text-sm font-bold text-brand-text">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Amortization Schedule Preview */}
        {schedule.length > 0 && (
          <div className="border border-brand-card-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setScheduleOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-brand-hover/20 hover:bg-brand-hover/40 transition-colors"
            >
              <span className="text-sm font-semibold text-brand-text">
                Payment Schedule ({duration} instalments)
              </span>
              {scheduleOpen ? <ChevronUp className="w-4 h-4 text-brand-text-secondary" /> : <ChevronDown className="w-4 h-4 text-brand-text-secondary" />}
            </button>

            {scheduleOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-hover/30 text-left">
                      <th className="px-3 py-2 text-xs font-semibold text-brand-text-secondary whitespace-nowrap">#</th>
                      <th className="px-3 py-2 text-xs font-semibold text-brand-text-secondary whitespace-nowrap">Month</th>
                      <th className="px-3 py-2 text-xs font-semibold text-brand-text-secondary whitespace-nowrap">Opening Bal.</th>
                      <th className="px-3 py-2 text-xs font-semibold text-brand-text-secondary whitespace-nowrap">Principal</th>
                      <th className="px-3 py-2 text-xs font-semibold text-brand-text-secondary whitespace-nowrap">Interest</th>
                      <th className="px-3 py-2 text-xs font-semibold text-brand-text-secondary whitespace-nowrap">Total Payment</th>
                      <th className="px-3 py-2 text-xs font-semibold text-brand-text-secondary whitespace-nowrap">Closing Bal.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.installment_no} className="border-t border-brand-card-border hover:bg-brand-hover/10">
                        <td className="px-3 py-2 text-brand-text-secondary">{row.installment_no}</td>
                        <td className="px-3 py-2 text-brand-text whitespace-nowrap">{row.month}</td>
                        <td className="px-3 py-2 text-brand-text-secondary">{formatCurrency(row.opening_balance)}</td>
                        <td className="px-3 py-2 text-brand-text font-medium">{formatCurrency(row.principal)}</td>
                        <td className="px-3 py-2 text-amber-600 font-medium">{formatCurrency(row.interest)}</td>
                        <td className="px-3 py-2 text-brand-text font-semibold">{formatCurrency(row.total)}</td>
                        <td className="px-3 py-2 text-brand-text-secondary">{formatCurrency(row.closing_balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-brand-hover/30 border-t border-brand-card-border font-semibold">
                      <td colSpan={3} className="px-3 py-2 text-xs text-brand-text-secondary">Totals</td>
                      <td className="px-3 py-2 text-sm text-brand-text">{formatCurrency(principal)}</td>
                      <td className="px-3 py-2 text-sm text-amber-600">{formatCurrency(interestAmount)}</td>
                      <td className="px-3 py-2 text-sm text-brand-text">{formatCurrency(totalRepayable)}</td>
                      <td className="px-3 py-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => {
              if (!formValid) {
                setErrorMessage(amountValidation ?? termValidation ?? "Please fix the form errors.");
                return;
              }
              setErrorMessage(null);
              setConfirmOpen(true);
            }}
            disabled={!formValid}
            className="px-6 py-2.5 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Review & Submit
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-brand-text mb-4">Confirm Loan Application</h3>
            <p className="text-brand-text-secondary text-sm mb-4">
              Once confirmed, the request will enter the approval workflow and be reviewed by the Union Representative first.
            </p>
            <div className="space-y-2 mb-4">
              {[
                { label: "Product", value: selectedProduct.name },
                { label: "Account Code", value: selectedProduct.account_code ?? "—" },
                { label: "Interest Method", value: calcMethod === "flat_rate" ? "Flat Rate" : "Reducing Balance" },
                { label: "Amount", value: formatCurrency(principal) },
                { label: "Duration", value: `${duration} months` },
                { label: "Monthly Repayment", value: formatCurrency(monthlyRepayment) },
                { label: "Total Interest", value: formatCurrency(interestAmount) },
                { label: "Total Repayment", value: formatCurrency(totalRepayable) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-100">
                  <span className="text-brand-text-secondary">{label}:</span>
                  <span className="font-semibold text-brand-text">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end mt-4">
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
                {loading ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 max-w-md z-50">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </GlassCard>
  );
}
