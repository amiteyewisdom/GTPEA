"use client";

import { useState } from "react";
import { DollarSign, Filter, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency, formatDate } from "@/utils/formatters";

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: "text-brand-warning", bgColor: "bg-brand-warning/20", label: "Pending" },
  under_review: { color: "text-blue-500", bgColor: "bg-blue-500/20", label: "Under Review" },
  approved: { color: "text-brand-success", bgColor: "bg-brand-success/20", label: "Approved" },
  rejected: { color: "text-brand-danger", bgColor: "bg-brand-danger/20", label: "Rejected" },
  disbursed: { color: "text-cyan-500", bgColor: "bg-cyan-500/20", label: "Disbursed" },
  on_hold: { color: "text-orange-500", bgColor: "bg-orange-500/20", label: "On Hold" },
};

interface WithdrawalRow {
  id: string;
  request_ref: string;
  employee_id: string;
  savings_id: string;
  amount: number;
  reason: string | null;
  status: string;
  requested_at: string;
  disbursement_date: string | null;
  employees?: {
    first_name: string;
    last_name: string;
    employee_no: string;
  } | null;
  savings?: {
    account_number: string;
    type: string;
  } | null;
}

interface WithdrawalsClientProps {
  withdrawals: WithdrawalRow[];
  total: number;
}

export function WithdrawalsClient({ withdrawals, total }: WithdrawalsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    savings_id: "",
    amount: "",
    reason: "",
  });

  // Fetch savings accounts when form is shown
  const handleShowForm = async () => {
    setShowForm(!showForm);
    if (!showForm) {
      try {
        const response = await fetch("/api/savings/accounts");
        const data = await response.json();
        if (response.ok) {
          setSavingsAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error("Failed to fetch savings accounts:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/withdrawals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savings_id: formData.savings_id,
          amount: Number(formData.amount),
          reason: formData.reason,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to submit withdrawal request");
      }

      setMessage({ type: "success", text: "Withdrawal request submitted successfully" });
      setFormData({ savings_id: "", amount: "", reason: "" });
      setShowForm(false);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Submission failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-brand-text">Withdrawal Requests</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-brand-card-border text-brand-text-secondary rounded-lg hover:bg-brand-hover transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={handleShowForm}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Withdrawal Request Form */}
      {showForm && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-text">New Withdrawal Request</h2>
            <button onClick={() => setShowForm(false)} className="text-brand-text-secondary hover:text-brand-text">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">Savings Account</label>
              <select
                value={formData.savings_id}
                onChange={(e) => setFormData({ ...formData, savings_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                required
              >
                <option value="">Select savings account</option>
                {savingsAccounts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.account_number} - {s.type} - {formatCurrency(s.balance || 0)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="1"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
                placeholder="Reason for withdrawal"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-brand-card-border text-brand-text rounded-lg hover:bg-brand-hover transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 transition-all"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Withdrawals Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-brand-card-border">
                {["Reference", "Member", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((r) => {
                const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                const memberName = r.employees 
                  ? `${r.employees.first_name} ${r.employees.last_name}`
                  : "Unknown";
                return (
                  <tr key={r.id} className="border-b border-brand-card-border hover:bg-brand-hover/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm font-semibold text-brand-text">{r.request_ref}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{memberName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-text">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bgColor}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{formatDate(r.requested_at)}</td>
                  </tr>
                );
              })}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-brand-text-secondary">
                    No withdrawal requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
