"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import SearchableList from "@/components/data/SearchableList";
import { formatCurrency } from "@/utils/formatters";
import { PiggyBank, Plus, Wallet, Pencil, X, Lock, Calendar } from "lucide-react";

const isLockPeriod = (() => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  // Lock from Aug 8 to Dec 31 (inclusive)
  if (month > 8 || month < 1) return true; // Sep-Dec
  if (month === 8 && day >= 8) return true; // Aug 8 onwards
  return false;
})();

const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

export function SavingsHistoryClient({
  totalSavings,
  thisMonth,
  contributions,
  monthlyBreakdown,
  savingsAccountId,
  monthlyContribution,
}: {
  totalSavings: number;
  thisMonth: number;
  contributions: any[];
  monthlyBreakdown: { year: number; month: number; total: number; count: number }[];
  savingsAccountId?: string | null;
  monthlyContribution?: number;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "transactions">("monthly");

  const handleUpdate = async () => {
    if (!savingsAccountId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/savings/update-contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savings_id: savingsAccountId, monthly_contribution: Number(newAmount) }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Update failed.");
      toast.success(payload.message ?? "Monthly contribution updated.");
      setEditOpen(false);
      setNewAmount("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Savings History</h1>
          <p className="text-sm text-brand-text-secondary md:text-base">
            View your savings contributions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <GlassCard className="p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-brand-card-bg p-3 text-brand-success">
                <PiggyBank className="h-5 w-5" />
              </div>
              <span className="text-sm text-brand-text-secondary">Total Savings</span>
            </div>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalSavings)}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-brand-card-bg p-3 text-brand-accent">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm text-brand-text-secondary">Current Month</span>
            </div>
            <p className="text-lg font-medium text-brand-text-secondary capitalize">{currentMonthName}</p>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(thisMonth)}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-card-bg p-3 text-brand-green">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="text-sm text-brand-text-secondary">Monthly Contribution</span>
              </div>
              {savingsAccountId && !isLockPeriod && (
                <button
                  onClick={() => { setNewAmount(String(monthlyContribution ?? 0)); setEditOpen(true); }}
                  className="flex items-center gap-1 text-xs font-medium text-brand-accent hover:text-brand-accent/80 transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Change
                </button>
              )}
            </div>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(monthlyContribution ?? 0)}</p>
            {isLockPeriod && (
              <p className="mt-1 flex items-center gap-1 text-xs text-brand-text-secondary">
                <Lock className="h-3 w-3" /> Changes locked Aug 8–Dec 31
              </p>
            )}
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-text">Monthly Savings Breakdown</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  viewMode === "monthly"
                    ? "bg-brand-accent text-white"
                    : "bg-brand-card-bg text-brand-text-secondary hover:bg-brand-hover"
                }`}
              >
                By Month
              </button>
              <button
                onClick={() => setViewMode("transactions")}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  viewMode === "transactions"
                    ? "bg-brand-accent text-white"
                    : "bg-brand-card-bg text-brand-text-secondary hover:bg-brand-hover"
                }`}
              >
                Transactions
              </button>
            </div>
          </div>

          {viewMode === "monthly" ? (
            monthlyBreakdown.length === 0 ? (
              <div className="py-8 text-center text-brand-text-secondary">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-brand-text-secondary/50" />
                <p>No monthly savings data found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyBreakdown.map((item) => {
                  const monthName = new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                  return (
                    <div key={`${item.year}-${item.month}`} className="flex items-center justify-between rounded-lg bg-brand-card-bg p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-brand-card-bg p-2 text-brand-accent">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-text capitalize">{monthName}</p>
                          <p className="text-xs text-brand-text-secondary">{item.count} transaction{item.count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-brand-text">{formatCurrency(item.total)}</p>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="space-y-3">
              {contributions.length === 0 ? (
                <div className="py-8 text-center text-brand-text-secondary">
                  <PiggyBank className="mx-auto mb-3 h-12 w-12 text-brand-text-secondary/50" />
                  <p>No savings contributions found</p>
                </div>
              ) : (
                contributions.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-lg bg-brand-card-bg p-4">
                    <PiggyBank className="h-5 w-5 text-brand-success" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-text">{formatCurrency(item.amount)}</p>
                      <p className="text-xs capitalize text-brand-text-secondary">
                        {item.contribution_type} · {item.reference}
                      </p>
                    </div>
                    <p className="text-xs text-brand-text-secondary">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Monthly Contribution</h3>
              <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Current: <span className="font-semibold">{formatCurrency(monthlyContribution ?? 0)}/month</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">New monthly amount (GH₵)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <p className="mt-2 text-xs text-gray-500">
              The Fund Manager will be notified and the new amount will be used in the next payroll export.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving || !newAmount || Number(newAmount) < 0}
                className="px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
