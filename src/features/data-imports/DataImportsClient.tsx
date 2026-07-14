"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import DataImportPanel from "@/components/data/DataImportPanel";
import { PayrollMasterFilePanel } from "@/components/payroll/PayrollMasterFilePanel";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";
import type { ImportHistoryItem } from "@/lib/imports/log-import";

type DataImportsClientProps = {
  initialHistory: ImportHistoryItem[];
};

export default function DataImportsClient({ initialHistory }: DataImportsClientProps) {
  const [history, setHistory] = useState(initialHistory);
  const router = useRouter();

  const refreshHistory = useCallback(async () => {
    const response = await fetch("/api/import/history");
    if (!response.ok) return;
    const data = await response.json();
    setHistory(data.history ?? []);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (initialHistory.length === 0) {
      refreshHistory();
    }
  }, [initialHistory.length, refreshHistory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Data Imports</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Upload employee, savings, loan records, and consolidated payroll master files.
        </p>
      </div>

      <PayrollMasterFilePanel onComplete={refreshHistory} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <DataImportPanel
            type="employees"
            title="Import Employees"
            description="Add or update staff records from a CSV file."
            onComplete={refreshHistory}
          />
          <DataImportPanel
            type="savings"
            title="Import Savings"
            description="Upload monthly savings contributions."
            onComplete={refreshHistory}
          />
          <DataImportPanel
            type="loans"
            title="Import Loans"
            description="Upload loan applications and balances."
            onComplete={refreshHistory}
          />
        </div>

        <GlassCard className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-brand-text">Import History</h3>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="flex items-center gap-3 rounded-lg bg-brand-card-bg p-3">
                <CheckCircle className="h-5 w-5 text-brand-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-brand-text">No imports yet</p>
                  <p className="text-xs text-brand-text-secondary">Your recent uploads will show here.</p>
                </div>
              </div>
            ) : (
              history.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="mb-4 text-xl font-semibold text-brand-text">Import Guidelines</h3>
        <div className="space-y-4">
          <Guideline
            icon={FileText}
            title="File Format"
            text="Use the template for each data type. Keep the header row unchanged."
          />
          <Guideline
            icon={AlertCircle}
            title="Data Validation"
            text="Employee numbers must already exist for savings and loan imports."
          />
          <Guideline
            icon={CheckCircle}
            title="Review Results"
            text="After each upload, check the import summary for skipped rows."
          />
        </div>
      </GlassCard>
    </div>
  );
}

function HistoryRow({ item }: { item: ImportHistoryItem }) {
  const statusColor =
    item.status === "success"
      ? "text-brand-success"
      : item.status === "warning"
        ? "text-brand-warning"
        : "text-brand-danger";

  const date = new Date(item.createdAt).toLocaleString();

  return (
    <div className="flex items-center gap-3 rounded-lg bg-brand-card-bg p-3">
      <CheckCircle className={`h-5 w-5 ${statusColor}`} />
      <div className="flex-1">
        <p className="text-sm font-medium capitalize text-brand-text">
          {item.type} import
        </p>
        <p className="text-xs text-brand-text-secondary">
          {item.filename} · {item.imported} imported
          {item.skipped > 0 ? ` · ${item.skipped} skipped` : ""}
        </p>
      </div>
      <p className="text-xs text-brand-text-secondary">{date}</p>
    </div>
  );
}

function Guideline({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof FileText;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-brand-accent" />
      <div>
        <p className="mb-1 text-sm font-medium text-brand-text">{title}</p>
        <p className="text-sm text-brand-text-secondary">{text}</p>
      </div>
    </div>
  );
}
