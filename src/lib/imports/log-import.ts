import type { AppSupabase } from "@/lib/supabase/types";
import type { ImportResult, ImportType } from "./process-import";

export async function logImportRun(
  supabase: AppSupabase,
  userId: string,
  type: ImportType,
  filename: string,
  result: ImportResult
) {
  await supabase.from("audit_logs").insert({
    action: "bulk_import",
    table_name: type,
    record_id: crypto.randomUUID(),
    performed_by: userId,
    new_values: {
      filename,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors.slice(0, 20),
    },
  });
}

export type ImportHistoryItem = {
  id: string;
  type: string;
  filename: string;
  imported: number;
  skipped: number;
  createdAt: string;
  status: "success" | "warning" | "error";
};

export async function fetchImportHistory(supabase: AppSupabase): Promise<ImportHistoryItem[]> {
  const { data } = await supabase
    .from("audit_logs")
    .select("id, table_name, new_values, created_at")
    .eq("action", "bulk_import")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row: any) => {
    const values = row.new_values ?? {};
    const imported = Number(values.imported ?? 0);
    const skipped = Number(values.skipped ?? 0);
    const errors = Array.isArray(values.errors) ? values.errors.length : 0;

    let status: ImportHistoryItem["status"] = "success";
    if (imported === 0 && (skipped > 0 || errors > 0)) status = "error";
    else if (skipped > 0 || errors > 0) status = "warning";

    return {
      id: row.id,
      type: row.table_name,
      filename: values.filename ?? "upload.csv",
      imported,
      skipped,
      createdAt: row.created_at,
      status,
    };
  });
}
