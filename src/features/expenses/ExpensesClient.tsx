"use client";

import { useState } from "react";
import { Plus, X, CheckCircle, AlertCircle, Receipt, Download, Trash2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useRouter } from "next/navigation";
import { useDownload } from "@/hooks/use-download";

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string | null;
  paid_to: string | null;
  receipt_ref: string | null;
  created_at: string;
}

const CATEGORIES = [
  "Administration",
  "Office Supplies",
  "Transport & Travel",
  "Communications",
  "Utilities",
  "Maintenance",
  "Training & Development",
  "Legal & Professional",
  "Bank Charges",
  "Miscellaneous",
];

export function ExpensesClient({ expenses: initial }: { expenses: Expense[] }) {
  const router = useRouter();
  const { download } = useDownload();
  const [expenses, setExpenses] = useState<Expense[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
    paid_to: "",
    receipt_ref: "",
  });

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: Number(formData.amount) }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to save expense.");
      setMessage({ type: "success", text: "Expense recorded successfully." });
      setExpenses([payload.expense, ...expenses]);
      setFormData({ title: "", category: "", amount: "", expense_date: new Date().toISOString().split("T")[0], description: "", paid_to: "", receipt_ref: "" });
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save expense." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setExpenses(expenses.filter((e) => e.id !== id));
      setMessage({ type: "success", text: "Expense deleted." });
    }
  };

  const handleExport = () => download("/api/reports/profit_loss", "gtpea_pl_report.csv");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Expenses</h1>
          <p className="text-sm text-brand-text-secondary">Capture and track all fund expenditures</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm font-medium text-brand-text hover:bg-brand-hover"
          >
            <Download className="h-4 w-4" />
            Export P&L
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-semibold text-brand-primary hover:bg-brand-accent/90"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <GlassCard className="p-4">
          <p className="text-xs text-brand-text-secondary">Total Expenses</p>
          <p className="mt-1 text-xl font-bold text-brand-danger">{formatCurrency(totalExpenses)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-brand-text-secondary">This Month</p>
          <p className="mt-1 text-xl font-bold text-brand-text">
            {formatCurrency(
              expenses
                .filter((e) => new Date(e.expense_date).getMonth() === new Date().getMonth())
                .reduce((s, e) => s + Number(e.amount), 0)
            )}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-brand-text-secondary">Total Entries</p>
          <p className="mt-1 text-xl font-bold text-brand-text">{expenses.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-brand-text-secondary">Categories</p>
          <p className="mt-1 text-xl font-bold text-brand-text">{Object.keys(byCategory).length}</p>
        </GlassCard>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-lg p-4 ${message.type === "success" ? "border border-green-200 bg-green-50 text-green-800" : "border border-red-200 bg-red-50 text-red-800"}`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-text">New Expense Entry</h2>
            <button onClick={() => setShowForm(false)} className="text-brand-text-secondary hover:text-brand-text">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Expense Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Office stationery purchase"
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Amount (GH₵)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="0.01"
                  step="0.01"
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Expense Date</label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Paid To</label>
                <input
                  type="text"
                  value={formData.paid_to}
                  onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                  placeholder="Vendor / Supplier name"
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Receipt / Ref No.</label>
                <input
                  type="text"
                  value={formData.receipt_ref}
                  onChange={(e) => setFormData({ ...formData, receipt_ref: e.target.value })}
                  placeholder="e.g. RCP-00123"
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Description / Notes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Additional details about this expense..."
                  className="w-full resize-none rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-brand-card-border px-4 py-2 text-sm text-brand-text hover:bg-brand-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green/90 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Category Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <GlassCard className="p-5">
          <h3 className="mb-4 font-semibold text-brand-text">By Category</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => (
                <div key={cat} className="rounded-lg bg-brand-card-bg p-3 border border-brand-card-border">
                  <p className="text-xs text-brand-text-secondary truncate">{cat}</p>
                  <p className="mt-1 text-sm font-bold text-brand-text">{formatCurrency(amt)}</p>
                </div>
              ))}
          </div>
        </GlassCard>
      )}

      {/* Expenses Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-brand-card-border">
                {["Date", "Title", "Category", "Paid To", "Receipt Ref", "Amount", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-brand-text-secondary">
                    No expenses recorded yet. Click "Add Expense" to get started.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-brand-card-border hover:bg-brand-hover/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{formatDate(expense.expense_date)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-brand-text">{expense.title}</p>
                      {expense.description && (
                        <p className="text-xs text-brand-text-secondary truncate max-w-[180px]">{expense.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-2.5 py-1 text-xs font-medium text-brand-accent border border-brand-accent/20">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{expense.paid_to ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-brand-text-secondary">{expense.receipt_ref ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-brand-danger">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-brand-text-secondary hover:text-brand-danger p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
