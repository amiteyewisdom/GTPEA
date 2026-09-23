"use client";

import { useRef, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { AlertCircle, CheckCircle, Upload, FileSpreadsheet, Loader2 } from "lucide-react";

type MasterUploadResult = {
  employees: { imported: number; skipped: number; errors: string[] };
  savings: { imported: number; skipped: number; errors: string[] };
  quickCash: { imported: number; skipped: number; errors: string[] };
  hirePurchase: { imported: number; skipped: number; errors: string[] };
  normalLoans: { imported: number; skipped: number; errors: string[] };
  lands: { imported: number; skipped: number; errors: string[] };
};

type MasterUploadResponse = {
  message: string;
  results: MasterUploadResult;
  summary: {
    totalImported: number;
    totalSkipped: number;
    totalErrors: number;
  };
  error?: string;
};

export default function MasterUploadPanel({ onComplete }: { onComplete?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<MasterUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pickFile(nextFile: File | null) {
    setFile(nextFile);
    setResult(null);
    setError(null);
    setUploadProgress("");
  }

  async function handleUpload() {
    if (!file) {
      setError("Choose an Excel file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);
    setUploadProgress("Uploading file...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress("Processing employees...");
      
      const response = await fetch("/api/import/master", {
        method: "POST",
        body: formData,
      });

      const data = await response.json() as MasterUploadResponse;
      
      if (!response.ok) {
        throw new Error(data.error || "Import failed.");
      }

      setUploadProgress("Processing complete!");
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onComplete?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Import failed.");
      setUploadProgress("");
    } finally {
      setUploading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-brand-text">Master Excel Upload</h3>
          <p className="text-sm text-brand-text-secondary">Upload the complete GTPEA Excel template to import all data at once</p>
        </div>
        <FileSpreadsheet className="w-5 h-5 text-brand-accent" />
      </div>

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
          {file ? file.name : "Drop GTPEA Final Template New.xlsx here"}
        </p>
        <p className="mb-4 text-sm text-brand-text-secondary">or browse from your computer</p>
        <label className="inline-block cursor-pointer rounded-lg bg-brand-accent px-6 py-2.5 font-medium text-brand-primary transition-all hover:bg-brand-accent/80">
          Browse Files
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <p className="mt-4 text-xs text-brand-text-secondary">Excel format (.xlsx, .xls)</p>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-3 font-medium text-brand-primary transition-all hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress || "Importing..."}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload and Import All Data
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle className="h-4 w-4" />
            <p className="flex-1 font-medium">{result.message}</p>
          </div>

          <div className="rounded-lg bg-brand-card-bg p-4">
            <h4 className="mb-3 font-semibold text-brand-text">Import Summary</h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-success">{result.summary.totalImported}</p>
                <p className="text-xs text-brand-text-secondary">Imported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-warning">{result.summary.totalSkipped}</p>
                <p className="text-xs text-brand-text-secondary">Skipped</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-danger">{result.summary.totalErrors}</p>
                <p className="text-xs text-brand-text-secondary">Errors</p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium text-brand-text">Details by Category:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-brand-text-secondary">Employees:</span>
                  <span className="font-medium">{result.results.employees.imported} imported</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-brand-text-secondary">Savings:</span>
                  <span className="font-medium">{result.results.savings.imported} imported</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-brand-text-secondary">Quick Cash:</span>
                  <span className="font-medium">{result.results.quickCash.imported} imported</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-brand-text-secondary">Hire Purchase:</span>
                  <span className="font-medium">{result.results.hirePurchase.imported} imported</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-brand-text-secondary">Normal Loans:</span>
                  <span className="font-medium">{result.results.normalLoans.imported} imported</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-brand-text-secondary">Lands:</span>
                  <span className="font-medium">{result.results.lands.imported} imported</span>
                </div>
              </div>

              {result.summary.totalErrors > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const allErrors = Object.values(result.results).flatMap(r => r.errors);
                      alert(`Errors:\n${allErrors.join('\n')}`);
                    }}
                    className="text-sm text-brand-accent hover:underline"
                  >
                    View {result.summary.totalErrors} error{result.summary.totalErrors > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}