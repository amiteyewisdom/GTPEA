"use client";

import { useRef, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Upload } from "lucide-react";
import { useDownload } from "@/hooks/use-download";
import type { ImportType } from "@/lib/imports/process-import";

type ImportResult = {
  imported: number;
  skipped: number;
  errors?: string[];
};

type DataImportPanelProps = {
  type: ImportType;
  title: string;
  description: string;
  onComplete?: () => void;
};

export default function DataImportPanel({
  type,
  title,
  description,
  onComplete,
}: DataImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { download, loading: downloading } = useDownload();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      formData.append("type", type);

      const response = await fetch("/api/import/data", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Import failed.");
      }

      setResult({
        imported: data.imported,
        skipped: data.skipped ?? 0,
        errors: data.errors,
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onComplete?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Import failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h3 className="mb-2 text-lg font-semibold text-brand-text">{title}</h3>
      <p className="mb-4 text-sm text-brand-text-secondary">{description}</p>

      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-all ${
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
        <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-brand-accent" />
        <p className="mb-2 font-medium text-brand-text">
          {file ? file.name : "Drop a CSV file here"}
        </p>
        <p className="mb-4 text-sm text-brand-text-secondary">or browse from your computer</p>
        <label className="inline-block cursor-pointer rounded-lg bg-brand-accent px-6 py-2.5 font-medium text-brand-primary transition-all hover:bg-brand-accent/80">
          Browse Files
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <p className="mt-4 text-xs text-brand-text-secondary">CSV format. Open in Excel if needed.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-3 font-medium text-brand-primary transition-all hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Importing..." : "Upload and Import"}
        </button>
        <button
          onClick={() => download(`/api/import/templates/${type}`, `gtpea_${type}_template.csv`)}
          disabled={downloading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-card-border bg-brand-card-bg px-4 py-3 text-brand-text transition-all hover:bg-brand-hover disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

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
              Imported {result.imported} row{result.imported === 1 ? "" : "s"}
              {result.skipped > 0 ? `, skipped ${result.skipped}` : ""}.
            </span>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-1 text-brand-text-secondary">
              {result.errors.slice(0, 5).map((item) => (
                <p key={item}>{item}</p>
              ))}
              {result.errors.length > 5 && (
                <p>And {result.errors.length - 5} more issues.</p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
