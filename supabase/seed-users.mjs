/**
 * Seed script: Create demo auth users + profiles for GTPEA
 *
 * Run with:
 *   node supabase/seed-users.mjs
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local if present
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !key.startsWith("#")) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {
  // ignore — maybe vars are already in process.env
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "superadmin@gtpea.com", password: "teamsufix31@", role: "super_admin", full_name: "Super Admin" },
  { email: "kay@gtpea.com", password: "tsg@123", role: "administrator", full_name: "Kay (Administrator)" },
  { email: "union@gtpea.com", password: "tsg@123", role: "union_rep", full_name: "Union Representative" },
  { email: "fund@gtpea.com", password: "tsg@123", role: "fund_manager", full_name: "Fund Manager" },
  { email: "chair@gtpea.com", password: "tsg@123", role: "chairperson", full_name: "Chairperson" },
  { email: "john@gtpea.com", password: "john123", role: "employee", full_name: "John Doe" },
  { email: "jane@gtpea.com", password: "123456", role: "employee", full_name: "Jane Smith" },
];

async function upsertProfile(userId, u) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: userId, full_name: u.full_name, role: u.role, is_active: true },
      { onConflict: "user_id" }
    );
  if (error) {
    console.error(`  ⚠️  Profile upsert failed for ${u.email}:`, error.message);
  } else {
    console.log(`  ✅ Profile upserted: ${u.email} → ${u.role}`);
  }
}

async function main() {
  // Pre-flight: verify API connectivity
  const { error: healthErr } = await supabase.auth.admin.listUsers({ perPage: 1 });
  if (healthErr) {
    console.error("Auth API connectivity check failed:", healthErr.message);
    process.exit(1);
  }
  console.log("Auth API reachable.\n");

  for (const u of USERS) {
    // 1. Create auth user
    const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role, full_name: u.full_name },
    });

    if (createErr) {
      const msg = createErr.message || JSON.stringify(createErr);
      if (msg.includes("already been registered") || msg.includes("already exists")) {
        console.log(`⚠️  ${u.email} already exists — updating profile`);
        const { data: list } = await supabase.auth.admin.listUsers({
          filter: `email.eq.${u.email}`,
        });
        const existing = list?.users?.[0];
        if (existing) {
          await upsertProfile(existing.id, u);
        } else {
          console.error(`  Could not find existing user ${u.email} to update profile`);
        }
        continue;
      }
      console.error(`❌ Failed to create ${u.email}:`, msg, createErr);
      continue;
    }

    console.log(`✅ Created auth user ${u.email}`);

    // 2. Explicitly upsert profile (covers trigger-swallowed cases)
    if (userData?.user?.id) {
      await upsertProfile(userData.user.id, u);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
