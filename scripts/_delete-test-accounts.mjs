import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const EMAILS = [
  "kofi.mensa@gtpea.test",
  "ama.owusu@gtpea.test",
  "kwame.asante@gtpea.test",
];

async function deleteEmployeeAccount(employee) {
  const eid = employee.id;
  console.log(`\n=== ${employee.employee_no} ${employee.first_name} ${employee.last_name} (${employee.email})`);

  // find auth user via profile (employee_id uuid, employee_no, or email)
  let profile = null;
  for (const col of ["employee_id"]) {
    const { data } = await admin.from("profiles").select("user_id").eq(col, eid).maybeSingle();
    if (data) { profile = data; break; }
  }
  if (!profile) {
    const { data } = await admin.from("profiles").select("user_id").eq("employee_id", employee.employee_no).maybeSingle();
    profile = data;
  }
  if (!profile && employee.email) {
    const { data } = await admin.from("profiles").select("user_id").eq("email", employee.email).maybeSingle();
    profile = data;
  }
  console.log("  profile user_id:", profile?.user_id ?? "none");

  const del = async (table, col = "employee_id", val = eid) => {
    const { error, count } = await admin.from(table).delete({ count: "exact" }).eq(col, val);
    if (error) console.log(`  ${table}: ERROR ${error.message}`);
    else if (count) console.log(`  ${table}: deleted ${count}`);
  };

  await del("savings");
  await del("loan_guarantors", "guarantor_id");

  const { data: loans } = await admin.from("loans").select("id").eq("employee_id", eid);
  const loanIds = (loans ?? []).map((l) => l.id);
  const { data: wrs } = await admin.from("withdrawal_requests").select("id").eq("employee_id", eid);
  const wIds = (wrs ?? []).map((w) => w.id);

  if (loanIds.length) {
    await admin.from("loan_amortization_schedules").delete().in("loan_id", loanIds);
    await admin.from("loan_guarantors").delete().in("loan_id", loanIds);
  }
  const filters = [
    loanIds.length ? `and(entity_type.eq.loan,entity_id.in.(${loanIds.join(",")}))` : null,
    wIds.length ? `and(entity_type.eq.withdrawal,entity_id.in.(${wIds.join(",")}))` : null,
  ].filter(Boolean);
  if (filters.length) {
    const { data: appr } = await admin.from("approvals").select("id").or(filters.join(","));
    const aIds = (appr ?? []).map((a) => a.id);
    if (aIds.length) {
      await admin.from("approval_actions").delete().in("approval_id", aIds);
      await admin.from("approvals").delete().in("id", aIds);
      console.log(`  approvals: deleted ${aIds.length}`);
    }
  }

  await del("loans");
  await del("repayments");
  await del("withdrawal_requests");
  await del("savings_contributions");
  await del("savings_adjustments");
  await del("beneficiaries");
  await del("statement_requests");
  await del("payroll_logs");
  await del("ledger_entries");
  await del("transactions");
  await del("dividends");
  await del("impersonation_sessions", "target_employee_id");

  if (profile?.user_id) {
    await admin.from("notifications").delete().eq("user_id", profile.user_id);
    await admin.from("impersonation_sessions").delete().eq("target_user_id", profile.user_id);
    await admin.from("profiles").delete().eq("user_id", profile.user_id);
    const { error } = await admin.auth.admin.deleteUser(profile.user_id);
    console.log("  auth user:", error ? `ERROR ${error.message}` : "deleted");
  }

  const { error } = await admin.from("employees").delete().eq("id", eid);
  console.log("  employee:", error ? `ERROR ${error.message}` : "deleted");

  await admin.from("audit_logs").insert({
    action: "EMPLOYEE_DELETED",
    entity_type: "employee",
    entity_id: eid,
    details: {
      employee_no: employee.employee_no,
      email: employee.email,
      full_name: `${employee.first_name} ${employee.last_name}`,
    },
  });
}

for (const email of EMAILS) {
  const { data: emp, error } = await admin
    .from("employees")
    .select("id, employee_no, email, first_name, last_name")
    .eq("email", email)
    .maybeSingle();
  if (error || !emp) {
    console.log(`${email}: no employee record — checking orphan auth user`);
    const { data: prof } = await admin.from("profiles").select("user_id").eq("email", email).maybeSingle();
    if (prof?.user_id) {
      await admin.from("notifications").delete().eq("user_id", prof.user_id);
      await admin.from("profiles").delete().eq("user_id", prof.user_id);
      const { error: e2 } = await admin.auth.admin.deleteUser(prof.user_id);
      console.log(`  orphan auth user: ${e2 ? `ERROR ${e2.message}` : "deleted"}`);
    } else {
      console.log("  nothing found");
    }
    continue;
  }
  await deleteEmployeeAccount(emp);
}
console.log("\nDONE");
