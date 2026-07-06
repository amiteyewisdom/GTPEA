"use client";

import { useState, useRef, useEffect } from "react";
import { BadgeCent, Plus, X, CheckCircle, AlertCircle, Search, MoreVertical, Edit2, Lock } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useRouter } from "next/navigation";

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

const LOCK_MONTHS = [1, 2, 3, 4];
const currentMonth = new Date().getMonth() + 1;
const isLockPeriod = LOCK_MONTHS.includes(currentMonth);
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function SavingsClient({ savings, total, totalBalance }: SavingsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({ savings_id: "", amount: "" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updateContribModal, setUpdateContribModal] = useState<{ row: SavingsRow } | null>(null);
  const [newContrib, setNewContrib] = useState("");
  const [contribLoading, setContribLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleUpdateContrib = async () => {
    if (!updateContribModal) return;
    setContribLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/savings/update-contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savings_id: updateContribModal.row.id, monthly_contribution: Number(newContrib) }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Update failed.");
      setMessage({ type: "success", text: payload.message });
      setUpdateContribModal(null);
      setNewContrib("");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Update failed." });
    } finally {
      setContribLoading(false);
    }
  };

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

  const handleCreateAccounts = async () => {
    setCreateLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/savings/create-accounts", { method: "POST" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to create accounts.");
      setMessage({ type: "success", text: payload.message });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to create accounts." });
    } finally {
      setCreateLoading(false);
    }
  };

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
            <BadgeCent className="w-5 h-5 text-brand-success" />
          </div>
          <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalBalance)}</p>
          <p className="text-xs text-brand-text-secondary mt-1">All active accounts</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-brand-text-secondary text-sm">Total Accounts</p>
            <BadgeCent className="w-5 h-5 text-brand-accent" />
          </div>
          <p className="text-2xl font-bold text-brand-text">{total}</p>
          <p className="text-xs text-brand-text-secondary mt-1">{savings.filter(s => s.status === "active").length} active</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-brand-text-secondary text-sm">Average Balance</p>
            <BadgeCent className="w-5 h-5 text-brand-accent" />
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateAccounts}
            disabled={createLoading}
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-card-border text-brand-text font-semibold rounded-lg hover:bg-brand-hover transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {createLoading ? "Creating..." : "Create Accounts"}
          </button>
          <button
            onClick={() => setShowContributeForm(!showContributeForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Contribute
          </button>
        </div>
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
                        <div className="relative inline-block" ref={openMenuId === s.id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                            className="text-brand-text-secondary hover:text-brand-text p-1 rounded hover:bg-brand-hover"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === s.id && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-brand-card-border rounded-lg shadow-lg z-20 overflow-hidden">
                              <button
                                onClick={() => { setUpdateContribModal({ row: s }); setNewContrib(String(s.monthly_contribution)); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-hover transition-colors"
                              >
                                {isLockPeriod ? <Lock className="w-4 h-4 text-orange-500" /> : <Edit2 className="w-4 h-4" />}
                                Change Monthly Amount
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Update monthly contribution modal */}
      {updateContribModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-text">Change Monthly Contribution</h3>
              <button onClick={() => { setUpdateContribModal(null); setNewContrib(""); }} className="text-brand-text-secondary hover:text-brand-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-brand-text-secondary mb-1">
              Account: <span className="font-semibold text-brand-text">{updateContribModal.row.account_number}</span>
            </p>
            <p className="text-sm text-brand-text-secondary mb-4">
              Current: <span className="font-semibold text-brand-text">{formatCurrency(updateContribModal.row.monthly_contribution)}/month</span>
            </p>
            {isLockPeriod && (
              <div className="flex items-start gap-2 p-3 mb-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Lock className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-700">
                  <span className="font-semibold">Contribution changes are locked</span> during January–April (payroll processing period). Changes will be accepted from May onwards.
                </p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-text mb-1">New Monthly Amount (GHS)</label>
              <div className="relative">
                <BadgeCent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                <input
                  type="number"
                  value={newContrib}
                  onChange={(e) => setNewContrib(e.target.value)}
                  min="1"
                  disabled={isLockPeriod}
                  className="w-full pl-9 pr-4 py-2.5 border border-brand-card-border rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="e.g. 500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setUpdateContribModal(null); setNewContrib(""); }}
                className="px-4 py-2 border border-brand-card-border text-brand-text rounded-lg hover:bg-brand-hover text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateContrib}
                disabled={isLockPeriod || contribLoading || !newContrib}
                className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-brand-green/90 transition-all"
              >
                {contribLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
