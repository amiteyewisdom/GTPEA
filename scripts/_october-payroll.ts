// One-off: process the October 2026 payroll deduction workbook.
// Usage: npx tsx scripts/_october-payroll.ts [--dry-run]
import * as fs from "fs";
import * as path from "path";

async function main() {
  const env: Record<string, string> = {};
  fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .forEach((l) => {
      const m = l.match(/^([^#=]+)=(.*)/);
      if (m) env[m[1].trim()] = m[2].trim();
    });
  Object.assign(process.env, env);

  const XLSX = require("xlsx");
  const { createClient } = await import("@supabase/supabase-js");
  const { parsePayrollDeductionWorkbook, processPayrollDeductionFile } = await import(
    "../src/lib/payroll/process-deduction-file"
  );

  const FILE = "TEX STYLES GHANA LTD_ October 2026_Payroll Details Cost(Transaction).xlsx";
  const PERIOD = { year: 2026, month: 10 };
  const DRY_RUN = process.argv.includes("--dry-run");

  const data = fs.readFileSync(path.join(process.cwd(), FILE));
  const rows = parsePayrollDeductionWorkbook(data);
  console.log(`Parsed ${rows.length} deduction rows.`);

  // Find an admin user id for audit/performed_by.
  const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: prof } = await s
    .from("profiles")
    .select("user_id, role")
    .in("role", ["super_admin", "administrator"])
    .limit(1)
    .maybeSingle();
  const userId = prof?.user_id;
  if (!userId) throw new Error("No admin profile found for performed_by.");
  console.log("Actor:", prof.role, userId);

  console.log(DRY_RUN ? "--- DRY RUN (no writes) ---" : "--- LIVE RUN ---");
  const result = await processPayrollDeductionFile(rows, PERIOD, userId, { dryRun: DRY_RUN });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
