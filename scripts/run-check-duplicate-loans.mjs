import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "../check-duplicate-loans.sql");
const sql = readFileSync(sqlPath, "utf8");

console.log("Paste the SQL below into Supabase → SQL Editor → Run:\n");
console.log("Project: https://supabase.com/dashboard/project/fgfoknqwxvvhjrqircdh/sql/new\n");
console.log(sql);
