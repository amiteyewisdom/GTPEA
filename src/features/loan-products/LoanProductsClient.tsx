"use client";

import { useState } from "react";
import { Plus, Edit, CheckCircle, X, AlertCircle, BadgeCent, Percent, Calendar, Shield } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatters";

interface Product {
  id: string;
  name: string;
  description: string | null;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  processing_fee_percent: number;
  requires_guarantor: boolean;
  max_loan_to_salary_ratio: number;
  is_active: boolean;
}

interface LoanProductsClientProps {
  products: Product[];
}

export function LoanProductsClient({ products }: LoanProductsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    interest_rate: "",
    min_amount: "",
    max_amount: "",
    min_term_months: "",
    max_term_months: "",
    processing_fee_percent: "",
    requires_guarantor: false,
    max_loan_to_salary_ratio: "",
    is_active: true,
  });

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      interest_rate: "",
      min_amount: "",
      max_amount: "",
      min_term_months: "",
      max_term_months: "",
      processing_fee_percent: "",
      requires_guarantor: false,
      max_loan_to_salary_ratio: "",
      is_active: true,
    });
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      interest_rate: String(product.interest_rate),
      min_amount: String(product.min_amount),
      max_amount: String(product.max_amount),
      min_term_months: String(product.min_term_months),
      max_term_months: String(product.max_term_months),
      processing_fee_percent: String(product.processing_fee_percent),
      requires_guarantor: product.requires_guarantor,
      max_loan_to_salary_ratio: String(product.max_loan_to_salary_ratio),
      is_active: product.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      ...formData,
      interest_rate: Number(formData.interest_rate),
      min_amount: Number(formData.min_amount),
      max_amount: Number(formData.max_amount),
      min_term_months: Number(formData.min_term_months),
      max_term_months: Number(formData.max_term_months),
      processing_fee_percent: Number(formData.processing_fee_percent),
      max_loan_to_salary_ratio: Number(formData.max_loan_to_salary_ratio),
    };

    try {
      if (editingProduct) {
        const response = await fetch("/api/loan-products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.error || "Failed to update loan product");
        }

        setMessage({ type: "success", text: "Loan product updated successfully" });
      } else {
        const response = await fetch("/api/loan-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.error || "Failed to add loan product");
        }

        setMessage({ type: "success", text: "Loan product added successfully" });
      }

      resetForm();
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to save loan product" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-brand-primary font-semibold rounded-lg hover:bg-brand-accent/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Loan Product
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {showForm && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-text">
              {editingProduct ? "Edit Loan Product" : "Add New Loan Product"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-brand-text-secondary hover:text-brand-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-text mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-text mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Processing Fee (%)</label>
                <input
                  type="number"
                  value={formData.processing_fee_percent}
                  onChange={(e) => setFormData({ ...formData, processing_fee_percent: e.target.value })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Min Amount</label>
                <input
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Max Amount</label>
                <input
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Min Term (months)</label>
                <input
                  type="number"
                  value={formData.min_term_months}
                  onChange={(e) => setFormData({ ...formData, min_term_months: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Max Term (months)</label>
                <input
                  type="number"
                  value={formData.max_term_months}
                  onChange={(e) => setFormData({ ...formData, max_term_months: e.target.value })}
                  min="1"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">Max Loan/Salary Ratio</label>
                <input
                  type="number"
                  value={formData.max_loan_to_salary_ratio}
                  onChange={(e) => setFormData({ ...formData, max_loan_to_salary_ratio: e.target.value })}
                  step="0.1"
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-brand-card-border rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requires_guarantor"
                  checked={formData.requires_guarantor}
                  onChange={(e) => setFormData({ ...formData, requires_guarantor: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-card-border text-brand-green focus:ring-brand-green"
                />
                <label htmlFor="requires_guarantor" className="text-sm font-medium text-brand-text">
                  Requires Guarantor
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-card-border text-brand-green focus:ring-brand-green"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-brand-text">
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-brand-card-border text-brand-text rounded-lg hover:bg-brand-hover transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 transition-all"
              >
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {products.length === 0 ? (
        <GlassCard className="py-8 text-center">
          <p className="text-brand-text-secondary">
            No loan products configured yet. Create your first product to start accepting applications.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <GlassCard
              key={product.id}
              className={`p-4 h-full flex flex-col gap-4 transition-all hover:shadow-lg ${
                product.is_active ? "border-brand-accent/30" : "border-brand-card-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-brand-text">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-brand-text-secondary mt-1">{product.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {product.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-brand-success bg-brand-success/10 border border-brand-success/25">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-brand-text-secondary bg-brand-text-secondary/10 border border-brand-text-secondary/20">
                      <X className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                  <button
                    onClick={() => startEditing(product)}
                    className="text-brand-text-secondary hover:text-brand-text"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-brand-card-border" />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Interest Rate", value: `${product.interest_rate}% p.a.`, color: "text-brand-accent", icon: Percent },
                  { label: "Processing Fee", value: `${product.processing_fee_percent}%`, color: "text-brand-text-secondary", icon: BadgeCent },
                  { label: "Min Amount", value: formatCurrency(product.min_amount), color: "text-brand-success", icon: BadgeCent },
                  { label: "Max Amount", value: formatCurrency(product.max_amount), color: "text-brand-success", icon: BadgeCent },
                  { label: "Term Range", value: `${product.min_term_months}–${product.max_term_months} mo.`, color: "text-brand-accent", icon: Calendar },
                  { label: "Max Loan/Salary", value: `${product.max_loan_to_salary_ratio}x`, color: "text-brand-warning", icon: BadgeCent },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className="bg-brand-card-bg/50 rounded-lg p-3 border border-brand-card-border">
                    <p className="text-xs text-brand-text-secondary font-medium mb-1">{label}</p>
                    <p className={`text-sm font-bold ${color} flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {product.requires_guarantor && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-brand-warning bg-brand-warning/10 border border-brand-warning/25 self-start">
                  <Shield className="w-3 h-3" />
                  Requires Guarantor
                </span>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
