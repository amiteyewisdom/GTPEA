"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Download, MoreVertical, X, CheckCircle, AlertCircle, ShieldOff, ShieldCheck } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useDownload } from "@/hooks/use-download";
import { useRouter } from "next/navigation";
import type { Employee } from "@/types/database";

interface EmployeesClientProps {
  employees: Employee[];
  total: number;
}

export function EmployeesClient({ employees, total }: EmployeesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { download, loading: exporting } = useDownload();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [suspendModal, setSuspendModal] = useState<{ employee: Employee; action: 'suspend' | 'unsuspend' } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendLoading, setSuspendLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuspendAction = async () => {
    if (!suspendModal) return;
    setSuspendLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/employees/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: suspendModal.employee.id,
          action: suspendModal.action,
          reason: suspendReason.trim(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Action failed.");
      setMessage({ type: "success", text: payload.message });
      setSuspendModal(null);
      setSuspendReason("");
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Action failed." });
    } finally {
      setSuspendLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    employee_no: "",
    department: "",
    position: "",
    salary: "",
    bank_name: "",
    bank_account_no: "",
    bank_branch: "",
    sort_code: "",
    monthly_savings: "",
  });

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
      emp.employee_no.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    );
  });

  const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
    active: { color: "text-brand-success", bgColor: "bg-brand-success/20", label: "Active" },
    inactive: { color: "text-brand-text-secondary", bgColor: "bg-brand-text-secondary/20", label: "Inactive" },
    suspended: { color: "text-brand-warning", bgColor: "bg-brand-warning/20", label: "Suspended" },
  };

  const handleExport = async () => {
    setMessage(null);
    try {
      await download("/api/reports/employees", "gtpea_employees.csv");
      setMessage({ type: "success", text: "Employee list downloaded." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not export employees.",
      });
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to add employee");
      }

      setMessage({ type: "success", text: "Employee added successfully" });
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        employee_no: "",
        department: "",
        position: "",
        salary: "",
        bank_name: "",
        bank_account_no: "",
        bank_branch: "",
        sort_code: "",
        monthly_savings: "",
      });
      setShowForm(false);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to add employee" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
          <input
            type="text"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-card-border text-brand-text-secondary rounded-lg hover:bg-brand-hover transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Add Employee Form */}
      {showForm && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-text">Add New Employee</h2>
            <button onClick={() => setShowForm(false)} className="text-brand-text-secondary hover:text-brand-text">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Employee No.</label>
                <input
                  type="text"
                  value={formData.employee_no}
                  onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                >
                  <option value="">Select department</option>
                  <option value="operations">Operations</option>
                  <option value="finance">Finance</option>
                  <option value="hr">Human Resources</option>
                  <option value="it">IT</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-text mb-2">Salary</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2 mt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-3 border-t border-brand-card-border pt-3">Bank & Savings Details</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="e.g. GCB Bank"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Bank Account No.</label>
                <input
                  type="text"
                  value={formData.bank_account_no}
                  onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                  placeholder="Account number"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Bank Branch</label>
                <input
                  type="text"
                  value={formData.bank_branch}
                  onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                  placeholder="e.g. Accra Main Branch"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Sort Code</label>
                <input
                  type="text"
                  value={formData.sort_code}
                  onChange={(e) => setFormData({ ...formData, sort_code: e.target.value })}
                  placeholder="e.g. 030100"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Monthly Savings (GH₵)</label>
                <input
                  type="number"
                  value={formData.monthly_savings}
                  onChange={(e) => setFormData({ ...formData, monthly_savings: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
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
                {loading ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Stats strip */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: "Total", value: total, color: "text-brand-accent" },
          { label: "Active", value: employees.filter((e) => e.status === "active").length, color: "text-brand-success" },
          { label: "Inactive", value: employees.filter((e) => e.status === "inactive").length, color: "text-brand-text-secondary" },
          { label: "Suspended", value: employees.filter((e) => e.status === "suspended").length, color: "text-brand-warning" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="px-4 py-2 rounded-lg bg-brand-card-bg border border-brand-card-border flex gap-2 items-center"
          >
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-xs text-brand-text-secondary">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-brand-card-border">
                {["Employee", "Employee No.", "Department", "Position", "Salary", "Date Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-brand-text-secondary text-sm">
                    {search
                      ? "No employees match your search."
                      : "No employees yet. Add your first employee to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const statusConfig = STATUS_CONFIG[emp.status] || STATUS_CONFIG.active;
                  return (
                    <tr key={emp.id} className="border-b border-brand-card-border hover:bg-brand-hover/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent border border-brand-accent/30 flex items-center justify-center text-xs font-bold">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-brand-text">
                              {emp.first_name} {emp.last_name}
                            </p>
                            <p className="text-xs text-brand-text-secondary">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-text-secondary font-mono">{emp.employee_no}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent/10 text-brand-accent border border-brand-accent/20 capitalize">
                          {emp.department.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-text-secondary">{emp.position}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-brand-text">{formatCurrency(emp.salary)}</td>
                      <td className="px-4 py-3 text-sm text-brand-text-secondary">{formatDate(emp.date_joined)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color} ${statusConfig.bgColor}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block" ref={openMenuId === emp.id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)}
                            className="text-brand-text-secondary hover:text-brand-text p-1 rounded hover:bg-brand-hover"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === emp.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-brand-card-border rounded-lg shadow-lg z-20 overflow-hidden">
                              {emp.status !== "suspended" ? (
                                <button
                                  onClick={() => { setSuspendModal({ employee: emp, action: "suspend" }); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <ShieldOff className="w-4 h-4" />
                                  Suspend Account
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setSuspendModal({ employee: emp, action: "unsuspend" }); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  Reactivate Account
                                </button>
                              )}
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

      {/* Suspend / Unsuspend confirmation modal */}
      {suspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-brand-text mb-2">
              {suspendModal.action === "suspend" ? "Suspend Account" : "Reactivate Account"}
            </h3>
            <p className="text-sm text-brand-text-secondary mb-4">
              {suspendModal.action === "suspend"
                ? `Are you sure you want to suspend ${suspendModal.employee.first_name} ${suspendModal.employee.last_name}? They will not be able to apply for loans while suspended.`
                : `Reactivate ${suspendModal.employee.first_name} ${suspendModal.employee.last_name}'s account?`}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-text mb-1">
                Reason <span className="text-brand-text-secondary font-normal">(optional)</span>
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={2}
                placeholder="Brief reason for this action…"
                className="w-full px-3 py-2 border border-brand-card-border rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setSuspendModal(null); setSuspendReason(""); }}
                className="px-4 py-2 border border-brand-card-border text-brand-text rounded-lg hover:bg-brand-hover text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendAction}
                disabled={suspendLoading}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all ${
                  suspendModal.action === "suspend"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-brand-green hover:bg-brand-green/90"
                }`}
              >
                {suspendLoading
                  ? "Processing…"
                  : suspendModal.action === "suspend"
                  ? "Confirm Suspend"
                  : "Confirm Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
