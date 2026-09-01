"use client";

import { useState } from "react";
import { Check, X, Clock, Shield, AlertCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatDate } from "@/utils/formatters";

interface GuarantorApplication {
  id: string;
  first_name: string;
  last_name: string;
  employee_no: string;
  guarantor_status: string;
  guarantor_application_date: string;
  guarantor_notes: string | null;
}

interface GuarantorApprovalsClientProps {
  applications: GuarantorApplication[];
  userRole: string;
}

export default function GuarantorApprovalsClient({
  applications,
  userRole,
}: GuarantorApprovalsClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleAction = async (
    applicationId: string,
    action: "approved" | "suspended" | "blacklisted"
  ) => {
    setLoading(applicationId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/guarantors/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: applicationId,
          action,
          notes: notes[applicationId] || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process application");
      }

      setSuccess(data.message || "Application processed successfully");
      setNotes((prev) => ({ ...prev, [applicationId]: "" }));
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
        <h1 className="text-2xl font-bold text-brand-text">Guarantor Applications</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Review and approve employee guarantor applications
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

      {applications.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Shield className="w-12 h-12 text-brand-text-secondary mx-auto mb-4" />
          <p className="text-brand-text-secondary">No pending guarantor applications</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <GlassCard key={application.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent font-bold">
                      {application.first_name[0]}{application.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-text">
                        {application.first_name} {application.last_name}
                      </h3>
                      <p className="text-sm text-brand-text-secondary">
                        Employee No: {application.employee_no}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-brand-text-secondary">
                    <Clock className="w-4 h-4" />
                    Applied: {formatDate(application.guarantor_application_date, "dd MMM yyyy")}
                  </div>

                  {application.guarantor_notes && (
                    <div className="mt-3 p-3 bg-brand-background rounded-lg">
                      <p className="text-sm text-brand-text-secondary">
                        <span className="font-semibold">Notes:</span> {application.guarantor_notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <textarea
                    value={notes[application.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [application.id]: e.target.value }))
                    }
                    placeholder="Add notes (optional)..."
                    rows={2}
                    className="w-full rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(application.id, "approved")}
                      disabled={loading === application.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading === application.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(application.id, "suspended")}
                      disabled={loading === application.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading === application.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(application.id, "blacklisted")}
                      disabled={loading === application.id}
                      className="flex items-center justify-center gap-2 bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading === application.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Blacklist
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
