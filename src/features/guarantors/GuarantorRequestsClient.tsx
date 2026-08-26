"use client";

import { useState } from "react";
import { Check, X, Clock, Shield, AlertCircle, BadgeCent } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatDate, formatCurrency } from "@/utils/formatters";

interface GuarantorRequest {
  id: string;
  loan_id: string;
  account_number: string | null;
  amount: number | null;
  consent_status: string;
  consent_notes: string | null;
  loans: {
    loan_ref: string;
    amount_requested: number;
    term_months: number;
    purpose: string | null;
    created_at: string;
    employee_id: string;
    employees: {
      first_name: string;
      last_name: string;
      employee_no: string;
    };
  };
}

interface GuarantorRequestsClientProps {
  requests: GuarantorRequest[];
  employeeId: string;
}

export default function GuarantorRequestsClient({
  requests,
  employeeId,
}: GuarantorRequestsClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleAction = async (
    requestId: string,
    action: "approved" | "rejected"
  ) => {
    setLoading(requestId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/guarantors/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          action,
          notes: notes[requestId] || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSuccess(data.message || "Request processed successfully");
      setNotes((prev) => ({ ...prev, [requestId]: "" }));
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Guarantor Consent Requests</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Review loan applications where you have been selected as a guarantor
        </p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <Check className="w-5 h-5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Shield className="w-12 h-12 text-brand-text-secondary mx-auto mb-4" />
          <p className="text-brand-text-secondary">No pending guarantor consent requests</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <GlassCard key={request.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <BadgeCent className="w-5 h-5 text-brand-accent" />
                    <div>
                      <h3 className="font-semibold text-brand-text">
                        {request.loans.loan_ref}
                      </h3>
                      <p className="text-sm text-brand-text-secondary">
                        {request.loans.employees.first_name} {request.loans.employees.last_name} ({request.loans.employees.employee_no})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-xs text-brand-text-secondary">Loan Amount</span>
                      <p className="text-sm font-semibold text-brand-text">
                        {formatCurrency(request.loans.amount_requested)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-brand-text-secondary">Term</span>
                      <p className="text-sm font-semibold text-brand-text">
                        {request.loans.term_months} months
                      </p>
                    </div>
                    {request.amount && (
                      <div>
                        <span className="text-xs text-brand-text-secondary">Guarantee Amount</span>
                        <p className="text-sm font-semibold text-brand-text">
                          {formatCurrency(request.amount)}
                        </p>
                      </div>
                    )}
                    {request.account_number && (
                      <div>
                        <span className="text-xs text-brand-text-secondary">Account Number</span>
                        <p className="text-sm font-semibold text-brand-text">
                          {request.account_number}
                        </p>
                      </div>
                    )}
                  </div>

                  {request.loans.purpose && (
                    <div className="mb-3 p-3 bg-brand-background rounded-lg">
                      <span className="text-xs text-brand-text-secondary">Purpose</span>
                      <p className="text-sm text-brand-text">{request.loans.purpose}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <Clock className="w-4 h-4" />
                    Requested: {formatDate(request.loans.created_at, "dd MMM yyyy")}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <textarea
                    value={notes[request.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [request.id]: e.target.value }))
                    }
                    placeholder="Add notes (optional)..."
                    rows={2}
                    className="w-full rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(request.id, "approved")}
                      disabled={loading === request.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading === request.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(request.id, "rejected")}
                      disabled={loading === request.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading === request.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
