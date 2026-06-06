"use client";

import { useState } from "react";
import { DollarSign, Filter, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatters";

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: "text-brand-warning", bgColor: "bg-brand-warning/20", label: "Pending" },
  under_review: { color: "text-blue-500", bgColor: "bg-blue-500/20", label: "Under Review" },
  approved: { color: "text-brand-success", bgColor: "bg-brand-success/20", label: "Approved" },
  rejected: { color: "text-brand-danger", bgColor: "bg-brand-danger/20", label: "Rejected" },
  disbursed: { color: "text-cyan-500", bgColor: "bg-cyan-500/20", label: "Disbursed" },
  on_hold: { color: "text-orange-500", bgColor: "bg-orange-500/20", label: "On Hold" },
};

export default function WithdrawalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    savings_id: "",
    amount: "",
    reason: "",
  });

  const rows = [
    { ref: "WD-2026-0001", member: "Kwame Asante", amount: 2500, status: "pending", date: "2026-05-20" },
    { ref: "WD-2026-0002", member: "Ama Mensah", amount: 5000, status: "approved", date: "2026-05-18" },
    { ref: "WD-2026-0003", member: "Yaw Boateng", amount: 1200, status: "disbursed", date: "2026-05-15" },
  ];

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
            onClick={() => setShowForm(!showForm)}
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
                <option value="1">Regular Savings - ₵150,000.00</option>
                <option value="2">Special Savings - ₵75,000.00</option>
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
              {rows.map((r) => {
                const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={r.ref} className="border-b border-brand-card-border hover:bg-brand-hover/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm font-semibold text-brand-text">{r.ref}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{r.member}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-text">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bgColor}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{r.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
