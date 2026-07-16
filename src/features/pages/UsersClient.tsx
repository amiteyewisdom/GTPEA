"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { exportUsersToCsv } from "@/lib/imports/process-users";
import { useDownload } from "@/hooks/use-download";
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react";

export function UsersClient({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.employeeId?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleExport = () => {
    const csv = exportUsersToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gtpea_users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Users Management</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Manage system users and their roles
        </p>
      </div>

      <GlassCard className="p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-brand-card-border bg-white py-2 pl-10 pr-4 text-brand-text outline-none focus:border-brand-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              <option value="all">All Roles</option>
              <option value="administrator">Administrator</option>
              <option value="fund_manager">Fund Manager</option>
              <option value="chairperson">Chairperson</option>
              <option value="union_rep">Trustee</option>
              <option value="employee">Employee</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-brand-card-border bg-white px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 rounded-lg border border-brand-card-border bg-brand-card-bg px-4 py-2 text-sm font-medium text-brand-text transition-all hover:bg-brand-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>

            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-brand-primary transition-all hover:bg-brand-accent/90"
            >
              <Upload className="h-4 w-4" />
              Import Users
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-card-border">
                {["User", "Email", "Employee ID", "Role", "Status", "Joined"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-sm font-medium text-brand-text-secondary">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-text-secondary">
                    <Users className="mx-auto mb-3 h-12 w-12 text-brand-text-secondary/50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-brand-card-border">
                    <td className="px-4 py-3 text-sm font-medium text-brand-text">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{user.email || "—"}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{user.employeeId}</td>
                    <td className="px-4 py-3 text-sm capitalize text-brand-text-secondary">{user.role.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{user.status}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-secondary">{user.joined}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {importOpen && <UserImportModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function UserImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { download, loading: downloading } = useDownload();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors?: string[] } | null>(null);
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

      const response = await fetch("/api/import/users", {
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
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Import failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-text">Import Users</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-brand-text-secondary">
          Upload a CSV to create system user accounts. Download the template to see the expected format.
          Imported users will need a password reset before their first login.
        </p>

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
          <p className="mb-2 font-medium text-brand-text">{file ? file.name : "Drop a CSV file here"}</p>
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
            onClick={() => download("/api/import/templates/users", "gtpea_users_template.csv")}
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
                Imported {result.imported} user{result.imported === 1 ? "" : "s"}
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
      </div>
    </div>
  );
}
