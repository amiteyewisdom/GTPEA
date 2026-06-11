import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationPath = join(__dirname, "../supabase/migrations/20250611000000_loan_workflow_rls.sql");
const sql = readFileSync(migrationPath, "utf8");

console.log("Paste the SQL below into Supabase → SQL Editor → Run:\n");
console.log("Project: https://supabase.com/dashboard/project/fgfoknqwxvvhjrqircdh/sql/new\n");
console.log(sql);
