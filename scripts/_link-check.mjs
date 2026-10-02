import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
});
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data: profs } = await sb
  .from("profiles")
  .select("id,user_id,full_name,role,employee_id,created_at")
  .order("created_at", { ascending: false });

for (const p of profs ?? []) {
  let match = "NO LINK";
  let emp = null;
  if (p.employee_id) {
    const byId = await sb.from("employees").select("id,employee_no,first_name,last_name,status").eq("id", p.employee_id).maybeSingle();
    emp = byId.data ?? (await sb.from("employees").select("id,employee_no,first_name,last_name,status").eq("employee_no", p.employee_id).maybeSingle()).data;
    match = emp ? `OK -> ${emp.employee_no} ${emp.first_name} ${emp.last_name}` : `BROKEN (${p.employee_id})`;
  }
  let data = "";
  if (emp) {
    const s = await sb.from("savings").select("balance").eq("employee_id", emp.id);
    const ln = await sb.from("loans").select("id,status").eq("employee_id", emp.id);
    data = ` | savings:[${(s.data ?? []).map((x) => x.balance).join(",") || "none"}] loans:${(ln.data ?? []).length}`;
  }
  console.log(`${p.created_at?.slice(0, 10)} | ${p.role} | ${p.full_name} | ${match}${data}`);
}
