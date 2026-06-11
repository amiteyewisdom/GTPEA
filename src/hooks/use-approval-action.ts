"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useApprovalAction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const act = async (approvalId: string, action: "approved" | "rejected", notes = "") => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/approvals/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_id: approvalId, action, notes }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Could not process approval.");
      }

      setMessage({ type: "success", text: payload.message || "Approval updated." });
      router.refresh();
      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Approval failed.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { act, loading, message, clearMessage: () => setMessage(null) };
}
