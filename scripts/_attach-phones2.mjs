import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

const wb = xlsx.readFile('GTPEA Data - Jun26 b.xlsx');
const rows = xlsx.utils.sheet_to_json(wb.Sheets['Data'], { header: 1 });
// col 1 = Uno (staff id), col 8 = Contact
function norm(v) {
  if (v == null) return null;
  let d = String(v).replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('233') && d.length === 12) d = '0' + d.slice(3);
  else if (d.length === 9 && !d.startsWith('0')) d = '0' + d;
  return /^0\d{9}$/.test(d) ? d : null;
}

const entries = [];
const invalid = [];
for (const r of rows.slice(1)) {
  if (!Array.isArray(r)) continue;
  const id = String(r[1] ?? '').trim();
  if (!id) continue;
  const p = norm(r[8]);
  if (p) entries.push({ id, phone: p });
  else invalid.push({ id, raw: r[8] });
}
console.log('valid:', entries.length, 'invalid/blank:', invalid.length);

let updated = 0, already = 0, conflict = 0, noEmp = 0;
const conflicts = [], missing = [];
for (const { id, phone } of entries) {
  const { data: emp } = await s.from('employees')
    .select('id,first_name,last_name,phone,phone_number')
    .eq('employee_no', id).maybeSingle();
  if (!emp) { missing.push(id); noEmp++; continue; }
  const existing = emp.phone_number || emp.phone;
  if (!existing) {
    const { error } = await s.from('employees')
      .update({ phone, phone_number: phone })
      .eq('id', emp.id);
    if (error) { console.log('FAIL', id, error.message); continue; }
    updated++;
  } else if (existing === phone) already++;
  else { conflicts.push({ id, name: `${emp.first_name} ${emp.last_name}`, existing, sheet: phone }); conflict++; }
}

console.log(`\nupdated: ${updated}, already-same: ${already}, conflicts: ${conflict}, no-employee: ${noEmp}`);
if (conflicts.length) console.log('CONFLICTS:', JSON.stringify(conflicts.slice(0, 40), null, 1));
if (missing.length) console.log('NO-EMP:', missing.slice(0, 40).join(', '));
if (invalid.length) console.log('INVALID:', invalid.slice(0, 20).map(i => i.id + '=' + i.raw).join(', '));
