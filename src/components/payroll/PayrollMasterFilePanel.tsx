"use client";

import { useMemo, useRef, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { buildPayrollMasterTemplate } from "@/lib/payroll/process-master-file";
import { useDownload } from "@/hooks/use-download";
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Upload, X } from "lucide-react";

export function PayrollMasterFilePanel({ onComplete }: { onComplete?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { download: downloadFile, loading: downloading } = useDownload();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [result, setResult] = useState<{ processed: number; errors?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentMonthLabel = useMemo(() => {
    return new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });
  }, [year, month]);

  function pickFile(nextFile: File | null) {
    setFile(nextFile);
    setResult(null);
    setError(null);
  }

  async function handleUpload() {
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("year", String(year));
      formData.append("month", String(month));

      const response = await fetch("/api/payroll/master-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setResult({ processed: data.processed, errors: data.errors });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onComplete?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const csv = buildPayrollMasterTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gtpea_payroll_master_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <GlassCard className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-brand-text">Monthly Payroll Master File</h3>
        <p className="text-sm text-brand-text-secondary">
          Upload savings contributions and loan recovery rows. Unrelated payroll allowances are ignored.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-text-secondary">Year</label>
          <input
            type="number"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="w-full rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-text-secondary">Month</label>
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="w-full rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-all ${
          dragging ? "border-brand-accent bg-brand-accent/10" : "border-brand-card-border hover:border-brand-accent/50"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) pickFile(dropped);
        }}
      >
        <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-brand-accent" />
        <p className="mb-1 font-medium text-brand-text">{file ? file.name : "Drop a payroll CSV or text report here"}</p>
        <p className="mb-3 text-sm text-brand-text-secondary">or browse from your computer</p>
        <label className="inline-block cursor-pointer rounded-lg bg-brand-accent px-5 py-2 text-sm font-medium text-brand-primary transition-all hover:bg-brand-accent/80">
          Browse Files
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-3 text-sm font-medium text-brand-primary transition-all hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Processing..." : `Upload for ${currentMonthLabel}`}
        </button>
        <button
          onClick={() => downloadFile("/api/payroll/master-file", "gtpea_payroll_master_export.csv")}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-card-border bg-brand-card-bg px-4 py-3 text-sm font-medium text-brand-text transition-all hover:bg-brand-hover disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Exporting..." : "Export Current State"}
        </button>
      </div>

      <button
        onClick={downloadTemplate}
        className="mt-3 text-sm text-brand-accent underline hover:text-brand-accent/80"
      >
        Download empty template
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/10 p-3 text-sm text-brand-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-2 rounded-lg border border-brand-card-border bg-brand-card-bg p-4 text-sm">
          <div className="flex items-center gap-2 text-brand-success">
            <CheckCircle className="h-4 w-4" />
            <span>
              Processed {result.processed} staff record{result.processed === 1 ? "" : "s"} for {currentMonthLabel}.
            </span>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-1 text-brand-text-secondary">
              {result.errors.slice(0, 5).map((item) => (
                <p key={item}>{item}</p>
              ))}
              {result.errors.length > 5 && <p>And {result.errors.length - 5} more issues.</p>}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
