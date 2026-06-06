"use client";

import { useState } from "react";
import { DollarSign, Plus, X, CheckCircle, AlertCircle, Search, MoreVertical } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface SavingsRow {
  id: string;
  account_number: string;
  type: string;
  status: string;
  balance: number;
  monthly_contribution: number;
  target_amount: number | null;
  interest_rate: number;
  opened_at: string;
  employees?: {
    first_name: string;
    last_name: string;
    employee_no: string;
    department: string;
  } | null;
}

interface SavingsClientProps {
  savings: SavingsRow[];
  total: number;
  totalBalance: number;
}

export function SavingsClient({ savings, total, totalBalance }: SavingsClientProps) {
  const [search, setSearch] = useState("");
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    savings_id: "",
    amount: "",
  });

  const filtered = savings.filter((s) => {
    const q = search.toLowerCase();
    const name = s.employees
      ? `${s.employees.first_name} ${s.employees.last_name}`.toLowerCase()
      : "";
    return (
      name.includes(q) ||
      s.account_number.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  });

  const avgBalance = total > 0 ? totalBalance / total : 0;

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/savings/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savings_id: formData.savings_id,
          amount: Number(formData.amount),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to add contribution");
      }

      setMessage({ type: "success", text: "Contribution added successfully" });
      setFormData({ savings_id: "", amount: "" });
      setShowContributeForm(false);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Contribution failed" });
    } finally {
      setLoading(false);
    }
  };

  const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
    active: { color: "text-brand-success", bgColor: "bg-brand-success/20", label: "Active" },
    frozen: { color: "text-blue-500", bgColor: "bg-blue-500/20", label: "Frozen" },
    closed: { color: "text-brand-danger", bgColor: "bg-brand-danger/20", label: "Closed" },
    suspended: { color: "text-orange-500", bgColor: "bg-orange-500/20", label: "Suspended" },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-brand-text-secondary text-sm">Total Savings Pool</p>
            <DollarSign className="w-5 h-5 text-brand-success" />
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalBalance)}</p>
          <p className="text-xs text-brand-text-secondary mt-1">All active accounts</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-brand-text-secondary text-sm">Total Accounts</p>
            <DollarSign className="w-5 h-5 text-brand-accent" />
          </div>
          <p className="text-2xl font-bold text-brand-text">{total}</p>
          <p className="text-xs text-brand-text-secondary mt-1">{savings.filter(s => s.status === "active").length} active</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-brand-text-secondary text-sm">Average Balance</p>
            <DollarSign className="w-5 h-5 text-brand-accent" />
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(avgBalance)}</p>
          <p className="text-xs text-brand-text-secondary mt-1">Per account</p>
        </GlassCard>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search accounts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent w-72"
          />
        </div>
        <button
          onClick={() => setShowContributeForm(!showContributeForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Contribute
        </button>
      </div>

      {/* Contribute Form */}
      {showContributeForm && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-text">Add Contribution</h2>
            <button onClick={() => setShowContributeForm(false)} className="text-brand-text-secondary hover:text-brand-text">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleContribute} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">Savings Account</label>
              <select
                value={formData.savings_id}
                onChange={(e) => setFormData({ ...formData, savings_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                required
              >
                <option value="">Select savings account</option>
                {savings.filter(s => s.status === "active").map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.account_number} - {s.employees ? `${s.employees.first_name} ${s.employees.last_name}` : 'Unknown'} ({formatCurrency(s.balance)})
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowContributeForm(false)}
                className="px-4 py-2 border border-brand-card-border text-brand-text rounded-lg hover:bg-brand-hover transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 transition-all"
              >
                {loading ? "Processing..." : "Add Contribution"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-card-border">
                {["Account Holder", "Account No.", "Type", "Balance", "Monthly", "Progress", "Rate", "Opened", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-brand-text-secondary text-sm">
                    {search ? "No accounts match your search." : "No savings accounts yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const progress = s.target_amount && s.target_amount > 0
                    ? Math.min((s.balance / s.target_amount) * 100, 100)
                    : null;
                  const statusConfig = STATUS_CONFIG[s.status] || STATUS_CONFIG.active;
                  return (
                    <tr key={s.id} className="border-b border-brand-card-border hover:bg-brand-hover/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-brand-text">
                          {s.employees ? `${s.employees.first_name} ${s.employees.last_name}` : "—"}
                        </p>
                        {s.employees && (
                          <p className="text-xs text-brand-text-secondary">{s.employees.employee_no}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-text-secondary font-mono">{s.account_number}</td>
                      <td className="px-4 py-3 text-sm text-brand-text-secondary capitalize">{s.type}</td>
                      <td className="px-4 py-3 text-sm font-bold text-brand-success">{formatCurrency(s.balance)}</td>
                      <td className="px-4 py-3 text-sm text-brand-text-secondary">{formatCurrency(s.monthly_contribution)}</td>
                      <td className="px-4 py-3 min-w-[120px]">
                        {progress !== null ? (
                          <div>
                            <div className="h-1.5 bg-brand-card-border rounded-full mb-1 overflow-hidden">
                              <div className="h-full bg-brand-accent rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-brand-text-secondary">{progress.toFixed(0)}% of {formatCurrency(s.target_amount!)}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-brand-text-secondary">—</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-brand-accent">{s.interest_rate}%</td>
                      <td className="px-4 py-3 text-sm text-brand-text-secondary">{formatDate(s.opened_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bgColor}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-brand-text-secondary hover:text-brand-text">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
