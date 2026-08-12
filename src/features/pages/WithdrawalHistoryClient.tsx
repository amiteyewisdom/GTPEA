"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ArrowUpCircle, Plus, X, CheckCircle, AlertCircle, BadgeCent } from "lucide-react";

export function WithdrawalHistoryClient({
  totalWithdrawals,
  thisMonth,
  withdrawals,
}: {
  totalWithdrawals: number;
  thisMonth: number;
  withdrawals: any[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    savings_id: "",
    amount: "",
    reason: "",
  });

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

      setMessage({
        type: "success",
        text: "PW request submitted. The approval and administrative process will take a maximum of 2 weeks.",
      });
      setFormData({ savings_id: "", amount: "", reason: "" });
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Submission failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with New Request button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-text">PW History</h1>
          <p className="text-sm text-brand-text-secondary">View your PW transactions</p>
        </div>
        <button
          onClick={handleShowForm}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
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
            <h2 className="text-lg font-bold text-brand-text">New PW Request</h2>
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
                <BadgeCent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
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

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GlassCard className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-card-bg p-3 text-brand-danger">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <span className="text-sm text-brand-text-secondary">Total PWs</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalWithdrawals)}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-brand-card-bg p-3 text-brand-accent">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <span className="text-sm text-brand-text-secondary">This Month</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(thisMonth)}</p>
        </GlassCard>
      </div>

      {/* Searchable List */}
      <SearchableList
        searchPlaceholder="Search PWs..."
        emptyMessage="No PW transactions found."
        items={withdrawals.map((item) => ({
          id: item.id,
          searchText: `${item.request_ref} ${item.reason ?? ""} ${item.status}`,
          content: (
            <div className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
              <ArrowUpCircle className="h-5 w-5 text-brand-danger" />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-text">{item.request_ref}</p>
                <p className="text-xs text-brand-text-secondary">
                  {formatCurrency(item.amount)} · {item.status}
                </p>
              </div>
              <p className="text-xs text-brand-text-secondary">{formatDate(item.requested_at)}</p>
            </div>
          ),
        }))}
      />
    </div>
  );
}
