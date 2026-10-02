import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = {};
fs.readFileSync(".env.local", "utf8").split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
});
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

for (const uid of ["db67ae61-78cc-4a90-b355-833e42fca4eb", "01d55b5c-295e-46a0-95a7-819233c8b7d9"]) {
  const { data, error } = await sb.auth.admin.getUserById(uid);
  console.log(uid, "->", data?.user?.email ?? "NOT FOUND", error?.message ?? "");
}

// how many auth users total?
const { data: list } = await sb.auth.admin.listUsers({ perPage: 100 });
console.log("total auth users:", list?.users?.length);
for (const u of list?.users ?? []) console.log("  ", u.email, u.created_at?.slice(0, 16));
