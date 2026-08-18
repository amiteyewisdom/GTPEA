"use client";

import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { useRouter } from "next/navigation";
import { BadgeCent, Calendar, AlertCircle, CheckCircle, X, Info, Users, Phone, Shield } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import {
  formatCurrency,
  calculateMonthlyRepayment,
  calculateTotalRepayable,
  calculateTotalInterest,
  numberToWords,
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
  requires_guarantor?: boolean;
  account_code?: string | null;
  description?: string | null;
}

interface EmployeeDetails {
  name: string;
  employeeNo: string;
  department: string;
  accountNumber: string | null;
  yearsInService: number;
}

interface GuarantorOption {
  id: string;
  first_name: string;
  last_name: string;
  employee_no: string;
  account_number: string | null;
}

interface LoanApplicationProps {
  loanProducts: LoanProduct[];
  employeeDetails?: EmployeeDetails | null;
  maxBorrowable?: number;
  savingsBalance?: number;
  activeLoanBalance?: number;
  guarantorEmployees?: GuarantorOption[];
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

export function LoanApplication({
  loanProducts,
  employeeDetails,
  maxBorrowable,
  savingsBalance,
  activeLoanBalance,
  guarantorEmployees = [],
}: LoanApplicationProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(loanProducts[0]?.id ?? "");
  const [principalStr, setPrincipalStr] = useState("");
  const [durationStr, setDurationStr] = useState("");
  const principal = principalStr === "" ? 0 : Number(principalStr);
  const duration = durationStr === "" ? 0 : Number(durationStr);
  const [purpose, setPurpose] = useState("");
  const [guarantorId, setGuarantorId] = useState("");
  const [guarantorAmountStr, setGuarantorAmountStr] = useState("");
  const [guarantorAccount, setGuarantorAccount] = useState("");
  const [additionalGuarantors, setAdditionalGuarantors] = useState<{ id: string; account: string; amount: string }[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => loanProducts.find((p) => p.id === productId) ?? loanProducts[0],
    [loanProducts, productId]
  );

  const selectedGuarantor = useMemo(
    () => guarantorEmployees.find((e) => e.id === guarantorId),
    [guarantorEmployees, guarantorId]
  );

  useMemo(() => {
    if (selectedGuarantor) {
      setGuarantorAccount(selectedGuarantor.account_number ?? "");
    } else {
      setGuarantorAccount("");
    }
  }, [selectedGuarantor]);

  const guarantorAmount = guarantorAmountStr === "" ? principal : Number(guarantorAmountStr);

  const requiresGuarantor =
    savingsBalance !== undefined && activeLoanBalance !== undefined
      ? savingsBalance <= activeLoanBalance
      : selectedProduct?.requires_guarantor ?? false;

  const usedGuarantorIds = [guarantorId, ...additionalGuarantors.map((g) => g.id)].filter(Boolean);

  const addAdditionalGuarantor = () => {
    if (additionalGuarantors.length >= 1) return;
    setAdditionalGuarantors([...additionalGuarantors, { id: "", account: "", amount: "" }]);
  };

  const updateAdditionalGuarantor = (index: number, patch: Partial<{ id: string; account: string; amount: string }>) => {
    const next = [...additionalGuarantors];
    next[index] = { ...next[index], ...patch };
    if (patch.id) {
      const emp = guarantorEmployees.find((e) => e.id === patch.id);
      next[index].account = emp?.account_number ?? "";
      next[index].amount = String(principal);
    }
    setAdditionalGuarantors(next);
  };

  const removeAdditionalGuarantor = (index: number) => {
    const next = [...additionalGuarantors];
    next.splice(index, 1);
    setAdditionalGuarantors(next);
  };

  const calcMethod = selectedProduct?.interest_calc_method ?? "reducing_balance";

  const monthlyRepayment = useMemo(() => {
    if (!selectedProduct || duration <= 0) return 0;
    return calculateMonthlyRepayment(principal, selectedProduct.interest_rate, duration, calcMethod);
  }, [principal, selectedProduct, duration, calcMethod]);

  const totalRepayable = useMemo(
    () => calculateTotalRepayable(principal, selectedProduct?.interest_rate ?? 0, duration, calcMethod),
    [principal, selectedProduct, duration, calcMethod]
  );

  const totalDividend = useMemo(
    () => calculateTotalInterest(principal, selectedProduct?.interest_rate ?? 0, duration, calcMethod),
    [principal, selectedProduct, duration, calcMethod]
  );

  const firstRepaymentDate = useMemo(() => format(addMonths(new Date(), 1), "dd MMM yyyy"), []);
  const expectedCompletionDate = useMemo(() => format(addMonths(new Date(), duration), "dd MMM yyyy"), [duration]);

  const amountValidation = amountError(selectedProduct, principal);
  const amountWarn = amountWarning(principal, maxBorrowable);
  const termValidation = termError(selectedProduct, duration);
  const guarantorMissing = requiresGuarantor && !guarantorId;
  const noSavings = savingsBalance === 0;
  const formValid = !amountValidation && !termValidation && Boolean(selectedProduct) && principal > 0 && !guarantorMissing && !noSavings;

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
          guarantor_id: selectedGuarantor?.id,
          guarantor_name: selectedGuarantor ? `${selectedGuarantor.first_name} ${selectedGuarantor.last_name}` : null,
          guarantor_staff_id: selectedGuarantor?.employee_no,
          guarantor_account: guarantorAccount || null,
          guarantor_amount: guarantorAmount || null,
          additional_guarantors: additionalGuarantors
            .filter((g) => g.id)
            .map((g) => ({
              guarantor_id: g.id,
              guarantor_account: g.account || null,
              guarantor_amount: g.amount === "" ? principal : Number(g.amount),
            })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit loan request.");
      }

      setSuccessMessage("Facility application submitted. The approval and administrative process will take a maximum of 2 weeks.");
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

  if (savingsBalance === 0) {
    return (
      <GlassCard className="p-8 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-200 mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-brand-text mb-2">No Savings Balance</h3>
        <p className="text-brand-text-secondary text-sm max-w-sm mx-auto">
          You need to have savings before you can apply for a loan. Please make a deposit to your savings account first.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard id="loan-application" className="p-6 mb-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-brand-text mb-1">Loan Application Form</h3>
            <p className="text-brand-text-secondary text-sm">
              Submit a facility request and track progress through Relief Committee, Fund Manager, and Chairperson review.
            </p>
          </div>

          {employeeDetails && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-brand-hover/30 border border-brand-card-border rounded-lg p-3 min-w-[260px]">
              <div>
                <p className="text-xs text-brand-text-secondary">Name</p>
                <p className="text-sm font-semibold text-brand-text">{employeeDetails.name}</p>
              </div>
              <div>
                <p className="text-xs text-brand-text-secondary">Account No.</p>
                <p className="text-sm font-semibold text-brand-text">{employeeDetails.accountNumber ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-brand-text-secondary">Department</p>
                <p className="text-sm font-semibold text-brand-text">{employeeDetails.department}</p>
              </div>
              <div>
                <p className="text-xs text-brand-text-secondary">Years in Service</p>
                <p className="text-sm font-semibold text-brand-text">{employeeDetails.yearsInService}</p>
              </div>
            </div>
          )}

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
          <label className="block text-sm font-medium text-brand-text mb-3">Select Facility Type</label>
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
                    {product.min_term_months}–{product.max_term_months} months
                  </span>
                </button>
              );
            })}
          </div>
          {selectedProduct?.description && (
            <p className="mt-2 text-xs text-brand-text-secondary">{selectedProduct.description}</p>
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
            {principal > 0 && (
              <p className="mt-1 text-xs text-brand-text-secondary italic">
                Amount in words: {numberToWords(principal)} Ghana Cedis
              </p>
            )}
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

        <div className="rounded-lg border border-brand-card-border bg-brand-hover/30 p-3">
          <p className="text-xs font-semibold text-brand-text mb-2">Repayment Period Guidelines</p>
          <ul className="text-xs text-brand-text-secondary space-y-1">
            <li>GH₵1,000 – GH₵1,500 : Payable within 12 months</li>
            <li>GH₵1,501 – GH₵2,000 : Payable within 18 months</li>
            <li>GH₵2,001 – GH₵5,000 : Payable within 24 months</li>
            <li>GH₵6,000 – GH₵10,000 : Payable within 36 months</li>
            <li>GH₵10,500 and above : Payable within 60 months</li>
          </ul>
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

        {/* Guarantor */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-accent" />
            <label className="text-sm font-medium text-brand-text">Guarantor</label>
            {requiresGuarantor && <span className="text-xs text-red-600 font-medium">* required</span>}
            {!requiresGuarantor && savingsBalance !== undefined && activeLoanBalance !== undefined && (
              <span className="text-xs text-brand-green font-medium">(not required because savings exceed total loan balance)</span>
            )}
          </div>
          <select
            value={guarantorId}
            onChange={(e) => setGuarantorId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          >
            <option value="">{guarantorEmployees.length ? "Select a guarantor" : "No guarantors available"}</option>
            {guarantorEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} ({emp.employee_no})
              </option>
            ))}
          </select>
          {selectedGuarantor ? (
            <div className="space-y-3 rounded-lg border border-brand-card-border bg-brand-card-bg/50 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-text-secondary" />
                  <div>
                    <p className="text-xs text-brand-text-secondary">Staff ID</p>
                    <p className="text-sm font-semibold text-brand-text">{selectedGuarantor.employee_no}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-text-secondary" />
                  <div>
                    <p className="text-xs text-brand-text-secondary">Name</p>
                    <p className="text-sm font-semibold text-brand-text">{selectedGuarantor.first_name} {selectedGuarantor.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-text-secondary" />
                  <div>
                    <p className="text-xs text-brand-text-secondary">Account No.</p>
                    <p className="text-sm font-semibold text-brand-text">{guarantorAccount || selectedGuarantor.account_number || "—"}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-text-secondary mb-1">Guarantor Amount Approved (GH₵)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={guarantorAmountStr}
                  placeholder={String(principal)}
                  onChange={(e) => setGuarantorAmountStr(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-1/2 sm:w-1/3 px-3 py-2 bg-white border border-brand-card-border rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
            </div>
          ) : requiresGuarantor ? (
            <p className="text-xs text-red-600">This product requires a guarantor before submission.</p>
          ) : null}

          {additionalGuarantors.map((entry, index) => {
            const emp = guarantorEmployees.find((e) => e.id === entry.id);
            return (
              <div key={index} className="space-y-3 rounded-lg border border-brand-card-border bg-brand-card-bg/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-text-secondary">Additional Guarantor {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAdditionalGuarantor(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <select
                  value={entry.id}
                  onChange={(e) => updateAdditionalGuarantor(index, { id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                >
                  <option value="">Select a guarantor</option>
                  {guarantorEmployees
                    .filter((e) => !usedGuarantorIds.includes(e.id) || e.id === entry.id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name} ({e.employee_no})
                      </option>
                    ))}
                </select>
                {emp && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-text-secondary" />
                      <div>
                        <p className="text-xs text-brand-text-secondary">Account No.</p>
                        <p className="text-sm font-semibold text-brand-text">{entry.account || emp.account_number || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-text-secondary mb-1">Amount Approved (GH₵)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={entry.amount}
                        placeholder={String(principal)}
                        onChange={(e) => updateAdditionalGuarantor(index, { amount: e.target.value.replace(/[^0-9.]/g, "") })}
                        className="w-full px-3 py-2 bg-white border border-brand-card-border rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {guarantorId && requiresGuarantor && additionalGuarantors.length < 1 && (
            <button
              type="button"
              onClick={addAdditionalGuarantor}
              className="text-xs font-semibold text-brand-green hover:text-brand-green-dark flex items-center gap-1"
            >
              + Add another guarantor ({1 - additionalGuarantors.length} remaining)
            </button>
          )}
        </div>

        {/* Loan Summary */}
        <div className="bg-brand-hover/30 border border-brand-card-border rounded-lg p-4">
          <h4 className="text-lg font-semibold text-brand-text mb-4">Facility Summary</h4>
          <div className="mb-4 rounded-lg border-2 border-brand-green bg-brand-green/10 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">Monthly Payment</p>
            <p className="mt-1 text-3xl font-bold text-brand-green">{formatCurrency(monthlyRepayment)}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Facility Type", value: selectedProduct.name },
              { label: "Requested Amount", value: formatCurrency(principal) },
              { label: "Number of Months", value: `${duration} months` },
              { label: "Total Repayment", value: formatCurrency(totalRepayable) },
              { label: "Total Interest", value: formatCurrency(totalDividend) },
              { label: "First Repayment", value: firstRepaymentDate },
              { label: "Completion Date", value: expectedCompletionDate },
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
            <h3 className="text-xl font-bold text-brand-text mb-4">Confirm Facility Application</h3>
            <p className="text-brand-text-secondary text-sm mb-4">
              Once confirmed, the request will enter the approval workflow and be reviewed by the Relief Committee first.
            </p>
            <div className="mb-4 rounded-lg border-2 border-brand-green bg-brand-green/10 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">Monthly Payment</p>
              <p className="mt-1 text-2xl font-bold text-brand-green">{formatCurrency(monthlyRepayment)}</p>
            </div>
            <div className="space-y-2 mb-4">
              {[
                { label: "Facility Type", value: selectedProduct.name },
                { label: "Amount", value: formatCurrency(principal) },
                { label: "Number of Months", value: `${duration} months` },
                { label: "Total Repayment", value: formatCurrency(totalRepayable) },
                { label: "Total Interest", value: formatCurrency(totalDividend) },
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
