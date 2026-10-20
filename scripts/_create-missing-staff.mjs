import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
const DEFAULT_PW = e.DEFAULT_USER_PASSWORD || 'Gtpea@2026';

const wb = xlsx.readFile('GTPEA Data - Jun26 b.xlsx');
const rows = xlsx.utils.sheet_to_json(wb.Sheets['Data'], { header: 1 });
// cols: 0 #, 1 Uno, 2 Name, 3 Location, 4 Department, 5 Coy, 6 Category, 7 IN/OUT, 8 Contact

function norm(v) {
  if (v == null) return null;
  let d = String(v).replace(/\D/g, '');
  if (d.startsWith('233') && d.length === 12) d = '0' + d.slice(3);
  else if (d.length === 9 && !d.startsWith('0')) d = '0' + d;
  return /^0\d{9}$/.test(d) ? d : null;
}

// existing employee numbers
let emps = [];
let from = 0;
while (true) {
  const { data } = await s.from('employees').select('employee_no').range(from, from + 999);
  if (!data?.length) break;
  emps = emps.concat(data);
  if (data.length < 1000) break;
  from += 1000;
}
const existing = new Set(emps.map(x => x.employee_no.toUpperCase()));

let created = 0;
const issues = [];
for (const r of rows.slice(1)) {
  if (!Array.isArray(r)) continue;
  const id = String(r[1] ?? '').trim();
  const name = String(r[2] ?? '').trim();
  if (!id || !name) continue;

  // skip if an account exists (exact or stripped variant)
  const up = id.toUpperCase();
  if (existing.has(up) || existing.has(up.replace(/^[A-Z]+/, ''))) continue;

  const parts = name.split(/\s+/);
  const first = parts[0];
  const last = parts.slice(1).join(' ') || 'Staff';
  const phone = norm(r[8]);
  const email = `${up.toLowerCase()}@staff.gtpea.local`;
  const dept = String(r[4] ?? '').trim() || 'Staff';
  const category = String(r[6] ?? '').trim();

  // 1. employee record
  const { data: newEmp, error: ee } = await s.from('employees').insert({
    employee_no: up,
    first_name: first,
    last_name: last,
    email,
    phone: phone,
    phone_number: phone,
    department: dept,
    position: category || 'Staff',
    status: 'active',
    date_joined: new Date().toISOString().slice(0, 10),
    salary: 0,
    monthly_savings: 0,
    bank_account_no: up,
    is_first_login: true,
    password_changed_at: null,
    role: 'employee',
  }).select('id').single();
  if (ee) { issues.push(`${id} ${name} — employee insert: ${ee.message}`); continue; }

  // 2. auth user
  const { data: nu, error: ae } = await s.auth.admin.createUser({
    email,
    password: DEFAULT_PW,
    email_confirm: true,
    user_metadata: { staff_id: up, employee_no: up, full_name: name },
  });
  if (ae) { issues.push(`${id} ${name} — auth create: ${ae.message}`); continue; }

  // 3. profile
  const { error: pe } = await s.from('profiles').insert({
    user_id: nu.user.id,
    employee_id: newEmp.id,
    full_name: name,
    role: 'employee',
    must_change_password: true,
    is_active: true,
    phone,
  });
  if (pe) { issues.push(`${id} ${name} — profile insert: ${pe.message}`); continue; }

  console.log(`OK  ${up.padEnd(8)} ${name}`);
  created++;
}

console.log(`\ncreated: ${created}`);
if (issues.length) console.log('ISSUES:\n' + issues.join('\n'));
