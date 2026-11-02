// Sep26 records update — applies "GTPEA Data - Sep26 29.10.2026.xlsx" (CU - Sep26 sheet)
//  - Normalizes employee_no to the file's T/P-prefixed format (login fallback added in app)
//  - Renames the 7 orange-highlighted renumbered staff IDs
//  - Overwrites savings balances + monthly_contribution (Savings, Quick-Cash)
//  - Overwrites loan outstanding_balance + monthly_repayment (Loan, School Fees, Hire Purcase, Land 2)
//  - Records deltas: savings_adjustments (signed) / repayments (payment_method='adjustment')
//  - Creates missing employees / savings accounts / loans
// Run: node scripts/_sep26-update.mjs [--dry]

import pkg from "xlsx";
const XLSX = pkg.default ?? pkg;
import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry");
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const PRODUCT_BY_FACILITY = {
  "Loan": "Normal Loan",
  "School Fees": "School Fees",
  "Hire Purcase": "Hire Purchase",
  "Land 2": "Land Loan",
  "Land": "Land Loan",
};
const SAVINGS_FACILITY = { "Savings": { type: "regular", code: "63101001" }, "Quick-Cash": { type: "special", code: "62131001" } };

function isSavingsLockPeriod() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  // Lock from Aug 8 to Dec 31 (inclusive)
  if (month > 8 || month < 1) return true; // Sep-Dec
  if (month === 8 && day >= 8) return true; // Aug 8 onwards
  return false;
}

// Orange-highlighted renumbers: newId -> old employee_no in DB
const RENUMBER = {
  P1361: "P0770", P1362: "P0774", P1363: "P0811", P1365: "P0821",
  P1366: "P1330", T1367: "0836", // P1364 handled by name (no ledger row in Jun file)
};

const norm = (n) => String(n ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const num = (v) => { const n = Number(String(v ?? "").replace(/,/g, "")); return Number.isFinite(n) ? n : 0; };

async function notifyBlockedImports(blockedImports) {
  if (blockedImports.length === 0) return;

  // Fetch chairpersons and admins
  const { data: admins } = await db
    .from("profiles")
    .select("user_id, role")
    .in("role", ["super_admin", "administrator", "chairperson"]);

  if (!admins || admins.length === 0) {
    console.warn("No admins/chairpersons found to notify about blocked imports");
    return;
  }

  const message = `⚠️ Savings Import Violations Detected (${blockedImports.length} blocked):\n\n` +
    blockedImports.map(b =>
      `- ${b.staffId} (${b.name}): ${b.facility} balance increase GH₵${b.increase.toFixed(2)} exceeds monthly contribution GH₵${b.monthlyContribution.toFixed(2)}\n` +
      `  Current: GH₵${b.currentBalance.toFixed(2)} → New: GH₵${b.newBalance.toFixed(2)}`
    ).join("\n\n") +
    "\n\nThese imports were blocked during the Aug 8–Dec 31 lock period.";

  for (const admin of admins) {
    await db.from("notifications").insert({
      user_id: admin.user_id,
      type: "security_alert",
      title: "Savings Imports Blocked - Balance Exceeds Monthly Contribution",
      message,
      is_read: false,
    });
  }

  console.log(`Notified ${admins.length} chairpersons/admins about ${blockedImports.length} blocked imports`);
}

async function fetchAll(table, cols) {
  let out = [], from = 0;
  while (true) {
    const { data, error } = await db.from(table).select(cols).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data?.length) break;
    out = out.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return out;
}

// ---------- 1. Parse workbook ----------
const wb = XLSX.readFile("GTPEA Data - Sep26 29.10.2026.xlsx");
const rows = XLSX.utils.sheet_to_json(wb.Sheets["CU - Sep26"], { header: 1 }).slice(2);

const people = new Map(); // newId -> {name, dept, contact, facilities: Map<fac, {amount, monthly, duration, item}>}
for (const r of rows) {
  const newId = String(r[9] ?? "").trim().toUpperCase();
  const facility = String(r[6] ?? "").trim();
  if (!newId || !facility) continue;
  const p = people.get(newId) ?? {
    name: String(r[10] ?? r[2] ?? "").trim().replace(/\s+/g, " "),
    dept: String(r[11] ?? "").trim(),
    contact: String(r[14] ?? "").trim(),
    facilities: new Map(),
  };
  const f = p.facilities.get(facility) ?? { amount: 0, monthly: 0, duration: 0, items: new Set() };
  f.amount += num(r[3]);
  f.monthly += num(r[4]);
  f.duration = Math.max(f.duration, num(r[5]));
  if (r[7]) f.items.add(String(r[7]).trim());
  p.facilities.set(facility, f);
  people.set(newId, p);
}
console.log(`Parsed ${people.size} staff IDs from CU - Sep26`);

// ---------- 2. Load DB ----------
const [employees, savings, loans, products] = await Promise.all([
  fetchAll("employees", "id, employee_no, first_name, last_name, email, phone_number, department"),
  fetchAll("savings", "id, employee_id, account_number, account_code, balance, monthly_contribution, type, status"),
  fetchAll("loans", "id, employee_id, loan_product_id, loan_ref, member_account_code, outstanding_balance, monthly_repayment, amount_approved, status"),
  fetchAll("loan_products", "id, name, account_code"),
]);
const productIdByName = Object.fromEntries(products.map((p) => [p.name, p.id]));

const empByNo = new Map(employees.map((e) => [e.employee_no.toUpperCase(), e]));
const empByName = new Map();
for (const e of employees) {
  const key = norm(`${e.first_name} ${e.last_name}`);
  (empByName.get(key) ?? empByName.set(key, []).get(key)).push(e);
}

const savingsByEmp = new Map();
for (const s of savings) (savingsByEmp.get(s.employee_id) ?? savingsByEmp.set(s.employee_id, []).get(s.employee_id)).push(s);
const loansByEmp = new Map();
for (const l of loans) (loansByEmp.get(l.employee_id) ?? loansByEmp.set(l.employee_id, []).get(l.employee_id)).push(l);

// ---------- 3. Resolve employee for each new ID ----------
const renumberByNew = RENUMBER;
const unmatched = [];
const renames = []; // {emp, newId}
let matched = 0;

for (const [newId, p] of people) {
  let emp = empByNo.get(newId);
  if (!emp && renumberByNew[newId]) emp = empByNo.get(renumberByNew[newId].toUpperCase());
  if (!emp) {
    const digits = newId.replace(/^[A-Z]+/, "");
    emp = empByNo.get(digits) ?? empByNo.get("P" + digits) ?? empByNo.get("T" + digits);
  }
  if (!emp) {
    // name fallback (covers renumbered P1364 + spelling variants)
    const candidates = empByName.get(norm(p.name)) ?? [];
    const rev = candidates.filter((e) => !people.has(e.employee_no.toUpperCase()));
    if (rev.length === 1) emp = rev[0];
    else if (rev.length > 1) {
      // try loose contains match
      const loose = rev.filter((e) => norm(`${e.first_name} ${e.last_name}`).includes(norm(p.name)) || norm(p.name).includes(norm(`${e.first_name} ${e.last_name}`)));
      if (loose.length === 1) emp = loose[0];
    }
  }
  if (!emp) { unmatched.push([newId, p]); continue; }
  matched++;
  empByNo.set(newId, emp);
  if (emp.employee_no.toUpperCase() !== newId) renames.push({ emp, newId });
}
console.log(`Matched ${matched} employees; ${unmatched.length} new; ${renames.length} ID renames`);
unmatched.forEach(([id, p]) => console.log("  NEW:", id, p.name));

// ---------- 4. Apply ----------
const stats = { renamed: 0, newEmps: 0, savingsUpd: 0, savingsNew: 0, loansUpd: 0, loansNew: 0, adj: 0, rep: 0 };
const errors = [];
const userId = null; // performed_by nullable

async function up(table, payload, col, val) {
  const q = db.from(table).update(payload).eq(col, val);
  const { error } = await q;
  if (error) throw new Error(`${table} update ${val}: ${error.message}`);
}

// 4a. renames (check conflicts first)
for (const { emp, newId } of renames) {
  const existing = empByNo.get(newId);
  if (existing && existing.id !== emp.id) { errors.push(`Rename conflict: ${emp.employee_no} -> ${newId} already taken`); continue; }
  if (!DRY) {
    await up("employees", { employee_no: newId }, "id", emp.id);
    // rewrite refs that end with the old staff id
    for (const s of savingsByEmp.get(emp.id) ?? []) {
      if (s.account_number?.toUpperCase().endsWith(emp.employee_no.toUpperCase()))
        await up("savings", { account_number: s.account_number.slice(0, -emp.employee_no.length) + newId }, "id", s.id);
    }
    for (const l of loansByEmp.get(emp.id) ?? []) {
      const patch = {};
      if (l.loan_ref?.toUpperCase().endsWith(emp.employee_no.toUpperCase()))
        patch.loan_ref = l.loan_ref.slice(0, -emp.employee_no.length) + newId;
      if (l.member_account_code?.toUpperCase().endsWith(emp.employee_no.toUpperCase()))
        patch.member_account_code = l.member_account_code.slice(0, -emp.employee_no.length) + newId;
      if (Object.keys(patch).length) await up("loans", patch, "id", l.id);
    }
  }
  stats.renamed++;
}

// 4b. new employees
const now = new Date();
for (const [newId, p] of unmatched) {
  const parts = p.name.split(/\s+/).filter(Boolean);
  const row = {
    employee_no: newId,
    first_name: parts[0] ?? newId,
    last_name: parts.slice(1).join(" ") || "-",
    email: `${newId.toLowerCase()}@staff.gtpea.local`,
    phone: p.contact || null,
    phone_number: p.contact || null,
    department: (p.dept || "operations").toLowerCase(),
    position: "Staff",
    date_joined: now.toISOString().slice(0, 10),
    salary: 0,
    status: "active",
  };
  if (!DRY) {
    const { data, error } = await db.from("employees").insert(row).select("id").single();
    if (error) { errors.push(`Insert employee ${newId}: ${error.message}`); continue; }
    empByNo.set(newId, { ...row, id: data.id });
    p._emp = { ...row, id: data.id };
  }
  stats.newEmps++;
}

// resolve employee object per newId (post-insert)
function empFor(newId, p) {
  return empByNo.get(newId) ?? p._emp;
}

// 4c. balances
const ACTIVE = ["active", "approved", "disbursed", "repaying"];
const blockedImports = []; // Track blocked imports for reporting
for (const [newId, p] of people) {
  const emp = empFor(newId, p);
  if (!emp) continue;

  for (const [facility, f] of p.facilities) {
    try {
      if (SAVINGS_FACILITY[facility]) {
        const { type, code } = SAVINGS_FACILITY[facility];
        const acct = (savingsByEmp.get(emp.id) ?? []).find((s) => s.account_code === code && s.status === "active")
          ?? (savingsByEmp.get(emp.id) ?? []).find((s) => s.type === type && s.status === "active");
        const oldBal = acct ? Number(acct.balance) : 0;
        const delta = f.amount - oldBal;

        // Check for balance increase violation during lock period
        if (isSavingsLockPeriod() && acct && delta > 0) {
          const monthlyContribution = Number(acct.monthly_contribution) || 0;
          if (delta > monthlyContribution) {
            blockedImports.push({
              staffId: newId,
              name: p.name,
              facility,
              currentBalance: oldBal,
              newBalance: f.amount,
              increase: delta,
              monthlyContribution,
            });
            console.log(`BLOCKED: ${newId} ${facility} - increase ${delta.toFixed(2)} exceeds monthly contribution ${monthlyContribution.toFixed(2)}`);
            continue; // Skip this import
          }
        }

        if (acct) {
          if (!DRY) await up("savings", { balance: f.amount, monthly_contribution: f.monthly }, "id", acct.id);
          stats.savingsUpd++;
        } else {
          if (!DRY) {
            const { data, error } = await db.from("savings").insert({
              employee_id: emp.id,
              account_number: `${code}${newId}`,
              account_code: code,
              balance: f.amount,
              type,
              status: "active",
              interest_rate: 0.05,
              monthly_contribution: f.monthly,
              opened_at: now.toISOString(),
              notes: `${facility} (Sep26 import)`,
            }).select("id").single();
            if (error) throw new Error(`savings insert ${newId}: ${error.message}`);
            (savingsByEmp.get(emp.id) ?? savingsByEmp.set(emp.id, []).get(emp.id)).push({ ...data, balance: f.amount });
          }
          stats.savingsNew++;
        }
        if (!DRY && Math.abs(delta) > 0.005 && acct) {
          await db.from("savings_adjustments").insert({
            savings_id: acct.id, employee_id: emp.id, amount: delta,
            reason: `Sep26 balance update ${facility}: ${oldBal.toFixed(2)} -> ${f.amount.toFixed(2)}`,
            reference: `SEP26-ADJ-${code}-${newId}-${acct.id.slice(0, 8)}`,
            created_by: userId,
          });
          stats.adj++;
        }
      } else if (PRODUCT_BY_FACILITY[facility]) {
        const productName = PRODUCT_BY_FACILITY[facility];
        const productId = productIdByName[productName];
        if (!productId) throw new Error(`No loan product ${productName}`);
        const empLoans = loansByEmp.get(emp.id) ?? [];
        let loan = empLoans.find((l) => l.loan_product_id === productId && ACTIVE.includes(l.status));
        // fallback: match by member_account_code prefix for renamed/dupe products
        if (!loan) {
          const code = products.find((x) => x.id === productId)?.account_code;
          loan = empLoans.find((l) => l.member_account_code?.startsWith(code) && ACTIVE.includes(l.status));
        }
        const oldBal = loan ? Number(loan.outstanding_balance) : 0;
        const delta = f.amount - oldBal;
        if (loan) {
          const status = f.amount <= 0 ? "completed" : "repaying";
          if (!DRY) await up("loans", { outstanding_balance: f.amount, monthly_repayment: f.monthly, status }, "id", loan.id);
          stats.loansUpd++;
          if (!DRY && delta < -0.005) {
            await db.from("repayments").insert({
              loan_id: loan.id, employee_id: emp.id, installment_no: 9000 + stats.rep,
              amount_due: -delta, amount_paid: -delta, principal_component: -delta, interest_component: 0,
              due_date: "2026-09-30", paid_date: "2026-09-30", status: "paid",
              payment_method: "adjustment",
              reference: `SEP26-ADJ-${loan.loan_ref ?? loan.id.slice(0, 8)}`,
              notes: `Sep26 balance update ${facility}: ${oldBal.toFixed(2)} -> ${f.amount.toFixed(2)}`,
            });
            stats.rep++;
          }
        } else {
          if (!DRY) {
            const ref = `${productName.split(" ")[0].toUpperCase()}-${newId}`;
            const { data, error } = await db.from("loans").insert({
              loan_ref: ref,
              member_account_code: `${products.find((x) => x.id === productId)?.account_code}${newId}`,
              employee_id: emp.id,
              loan_product_id: productId,
              amount_requested: f.amount,
              amount_approved: f.amount,
              amount_disbursed: f.amount,
              outstanding_balance: f.amount,
              interest_rate: 0.02,
              term_months: Math.ceil(f.duration) || 12,
              monthly_repayment: f.monthly || Math.ceil(f.amount / (Math.ceil(f.duration) || 12) * 100) / 100,
              purpose: [...f.items][0] || productName,
              disbursement_date: "2026-09-30",
              status: f.amount > 0 ? "repaying" : "completed",
            }).select("id").single();
            if (error) throw new Error(`loan insert ${newId} ${facility}: ${error.message}`);
            (loansByEmp.get(emp.id) ?? loansByEmp.set(emp.id, []).get(emp.id)).push({ ...data, loan_product_id: productId });
          }
          stats.loansNew++;
        }
      }
    } catch (e) {
      errors.push(`${newId} ${facility}: ${e.message}`);
    }
  }
}

// 4d. audit trail
if (!DRY) {
  await db.from("audit_logs").insert({
    action: "sep26_records_update",
    table_name: "employees,savings,loans",
    record_id: crypto.randomUUID(),
    performed_by: userId,
    new_values: { stats, errors: errors.slice(0, 50), blockedImports },
  });

  // Notify chairpersons and admins about blocked imports
  await notifyBlockedImports(blockedImports);
}

console.log("\n=== RESULTS ===");
console.log(JSON.stringify(stats, null, 2));
console.log(`Errors: ${errors.length}`);
errors.slice(0, 60).forEach((e) => console.log("  ", e));

if (blockedImports.length > 0) {
  console.log("\n=== BLOCKED IMPORTS (Aug 8–Dec 31 Lock Period) ===");
  console.log(`Total blocked: ${blockedImports.length}`);
  blockedImports.forEach((b) => {
    console.log(`  ${b.staffId} (${b.name}) - ${b.facility}:`);
    console.log(`    Current: GH₵${b.currentBalance.toFixed(2)} → New: GH₵${b.newBalance.toFixed(2)} (increase: GH₵${b.increase.toFixed(2)})`);
    console.log(`    Monthly contribution: GH₵${b.monthlyContribution.toFixed(2)}`);
    console.log(`    Violation: Increase exceeds monthly contribution by GH₵${(b.increase - b.monthlyContribution).toFixed(2)}`);
  });
  console.log("\n⚠️ These imports were blocked. Chairpersons and admins have been notified.");
}

if (DRY) console.log("\n(dry run — nothing written)");
