"use client";

import { useState } from "react";
import { Plus, X, CheckCircle, AlertCircle, Trash2, AlertTriangle, BadgeCent } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_no: string;
}

interface Charge {
  id: string;
  employee_id: string;
  type: "fee" | "penalty";
  amount: number;
  description: string;
  reference: string;
  created_at: string;
  employees?: { first_name: string; last_name: string; employee_no: string } | null;
}

const TYPE_BADGE: Record<string, string> = {
  fee:     "bg-amber-100 text-amber-700",
  penalty: "bg-red-100 text-red-700",
};

const CHARGE_DESCRIPTIONS = {
  fee: [
    "Loan processing fee",
    "Account maintenance fee",
    "Statement request fee",
    "Certificate issuance fee",
    "Administration fee",
  ],
  penalty: [
    "Late repayment penalty",
    "Missed payment penalty",
    "Early settlement penalty",
    "Insufficient funds penalty",
    "Document submission penalty",
  ],
};

export function ChargesClient({
  charges: initial,
  employees,
}: {
  charges: Charge[];
  employees: Employee[];
}) {
  const [charges, setCharges] = useState<Charge[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    type: "fee" as "fee" | "penalty",
    amount: "",
    description: "",
    reference: "",
  });

  const totalFees = charges.filter((c) => c.type === "fee").reduce((s, c) => s + Number(c.amount), 0);
  const totalPenalties = charges.filter((c) => c.type === "penalty").reduce((s, c) => s + Number(c.amount), 0);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: Number(formData.amount) }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to record charge.");
      setMessage({ type: "success", text: "Charge recorded successfully." });
      setCharges([payload.charge, ...charges]);
      setFormData({ employee_id: "", type: "fee", amount: "", description: "", reference: "" });
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed." });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = CHARGE_DESCRIPTIONS[formData.type] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Member Charges</h1>
          <p className="text-sm text-brand-text-secondary">Record loan processing fees and late payment penalties</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-semibold text-brand-primary hover:bg-brand-accent/90"
        >
          <Plus className="h-4 w-4" />
          Add Charge
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs text-brand-text-secondary">Total Charges Collected</p>
          <p className="mt-1 text-xl font-bold text-brand-text">{formatCurrency(totalFees + totalPenalties)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2">
            <BadgeCent className="h-4 w-4 text-amber-600" />
            <p className="text-xs text-brand-text-secondary">Processing Fees</p>
          </div>
          <p className="mt-1 text-xl font-bold text-amber-600">{formatCurrency(totalFees)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-xs text-brand-text-secondary">Penalties</p>
          </div>
          <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(totalPenalties)}</p>
        </GlassCard>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-lg p-4 ${message.type === "success" ? "border border-green-200 bg-green-50 text-green-800" : "border border-red-200 bg-red-50 text-red-800"}`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Add Charge Form */}
      {showForm && (
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-text">New Charge Entry</h2>
            <button onClick={() => setShowForm(false)} className="text-brand-text-secondary hover:text-brand-text">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Member</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                >
                  <option value="">Select member</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_no})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Charge Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "fee" | "penalty", description: "" })}
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                >
                  <option value="fee">Processing Fee</option>
                  <option value="penalty">Late Payment Penalty</option>
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
                  placeholder="0.00"
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Reference No.</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Auto-generated if blank"
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-brand-text">Description</label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, description: s })}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${formData.description === s ? "border-brand-green bg-brand-green text-white" : "border-brand-card-border bg-white text-brand-text-secondary hover:bg-brand-hover"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the charge..."
                  className="w-full rounded-lg border border-brand-card-border bg-white px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green"
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
                {loading ? "Saving..." : "Record Charge"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Charges Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-card-border">
                {["Date", "Member", "Type", "Description", "Reference", "Amount"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {charges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-brand-text-secondary">
                    No charges recorded yet.
                  </td>
                </tr>
              ) : (
                charges.map((c) => (
                  <tr key={c.id} className="border-b border-brand-card-border hover:bg-brand-hover/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-brand-text">
                        {c.employees ? `${c.employees.first_name} ${c.employees.last_name}` : "—"}
                      </p>
                      {c.employees?.employee_no && (
                        <p className="text-xs text-brand-text-secondary">{c.employees.employee_no}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TYPE_BADGE[c.type] ?? "bg-slate-100 text-slate-600"}`}>
                        {c.type === "fee" ? "Processing Fee" : "Penalty"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{c.description || "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-brand-text-secondary">{c.reference}</td>
                    <td className="px-4 py-3 text-sm font-bold text-brand-text">{formatCurrency(Number(c.amount))}</td>
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
