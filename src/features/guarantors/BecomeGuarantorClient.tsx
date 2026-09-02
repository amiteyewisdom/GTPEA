"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface BecomeGuarantorClientProps {
  employee: {
    id: string;
    guarantor_status: string | null;
    guarantor_application_date: string | null;
    guarantor_notes: string | null;
    guarantor_approved_at: string | null;
    blacklist_reason: string | null;
  } | null;
  userName: string;
}

export default function BecomeGuarantorClient({
  employee,
  userName,
}: BecomeGuarantorClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/guarantors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
      setTimeout(() => router.refresh(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const status = employee?.guarantor_status || "none";
  
  // If status is pending, show pending state instead of apply button
  if (status === "pending") {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-brand-text mb-2">
            Application Under Review
          </h2>
          <p className="text-sm text-brand-text-secondary mb-4">
            Your guarantor application is being reviewed by the Union Representative.
          </p>
          {employee?.guarantor_application_date && (
            <p className="text-xs text-brand-text-secondary">
              Applied on: {new Date(employee.guarantor_application_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </GlassCard>
    );
  }

  // If status is approved, show approved guarantor badge
  if (status === "approved") {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-brand-text mb-2">
            You are an Approved Guarantor
          </h2>
          <p className="text-sm text-brand-text-secondary mb-4">
            Congratulations! You can now be selected as a guarantor for loan applications.
          </p>
          {employee?.guarantor_approved_at && (
            <p className="text-xs text-brand-text-secondary">
              Approved on: {new Date(employee.guarantor_approved_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Become a Guarantor</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Apply to become an approved guarantor for loan applications
        </p>
      </div>

      {status === "none" && (
        <GlassCard className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10 mb-4">
              <Shield className="w-8 h-8 text-brand-accent" />
            </div>
            <h2 className="text-xl font-bold text-brand-text mb-2">
              Apply to Become a Guarantor
            </h2>
            <p className="text-sm text-brand-text-secondary mb-6 max-w-md mx-auto">
              As a guarantor, you can support other employees&apos; loan applications. This is a
              serious responsibility that requires approval from the Union Representative.
            </p>

            <div className="text-left bg-brand-background rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-brand-text mb-2">Requirements:</h3>
              <ul className="text-sm text-brand-text-secondary space-y-1">
                <li>• Must be an active employee for at least 6 months</li>
                <li>• Must have a good repayment history</li>
                <li>• Must have sufficient savings balance</li>
                <li>• Will be financially responsible if borrower defaults</li>
              </ul>
            </div>

            <button
              onClick={handleApply}
              disabled={loading}
              className="w-full bg-brand-green text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Apply to Become a Guarantor"}
            </button>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Application submitted successfully!
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {status === "suspended" && (
        <GlassCard className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-brand-text mb-2">
              Guarantor Application Rejected
            </h2>
            <p className="text-sm text-brand-text-secondary mb-4">
              Your guarantor application was rejected. You can amend and resubmit your application.
            </p>
            {employee?.guarantor_notes && (
              <div className="mt-4 bg-brand-background rounded-lg p-4 text-left">
                <p className="text-sm text-brand-text-secondary">
                  <span className="font-semibold">Reason:</span> {employee.guarantor_notes}
                </p>
              </div>
            )}
            <button
              onClick={handleApply}
              disabled={loading}
              className="mt-4 w-full bg-brand-green text-white font-semibold py-3 px-6 rounded-lg hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Amend and Resubmit"}
            </button>
          </div>
        </GlassCard>
      )}

      {status === "blacklisted" && (
        <GlassCard className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <XCircle className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-text mb-2">
              Blacklisted from Being a Guarantor
            </h2>
            <p className="text-sm text-brand-text-secondary mb-4">
              You have been blacklisted from becoming a guarantor. Please contact the union representative for more information.
            </p>
            {employee?.blacklist_reason && (
              <div className="mt-4 bg-brand-background rounded-lg p-4 text-left">
                <p className="text-sm text-brand-text-secondary">
                  <span className="font-semibold">Reason:</span> {employee.blacklist_reason}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
