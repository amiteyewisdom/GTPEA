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

let emps = [];
let from = 0;
while (true) {
  const { data } = await s.from('employees').select('id,employee_no,first_name,last_name,phone,phone_number').range(from, from + 999);
  if (!data?.length) break;
  emps = emps.concat(data);
  if (data.length < 1000) break;
  from += 1000;
}
const byNo = new Map(emps.map(x => [x.employee_no.toUpperCase(), x]));

function norm(v) {
  if (v == null) return null;
  let d = String(v).replace(/\D/g, '');
  if (d.startsWith('233') && d.length === 12) d = '0' + d.slice(3);
  else if (d.length === 9 && !d.startsWith('0')) d = '0' + d;
  return /^0\d{9}$/.test(d) ? d : null;
}
const normName = n => String(n || '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
function nameMatches(emp, sheetName) {
  const a = new Set(`${emp.first_name} ${emp.last_name}`.toLowerCase().split(/\s+/));
  const b = new Set(normName(sheetName).split(' '));
  b.delete('jnr'); b.delete('snr'); b.delete('jr'); b.delete('sr');
  for (const w of b) if (w.length > 2 && a.has(w)) return true;
  return false;
}

let updated = 0, already = 0, conflict = 0, skipped = 0, failed = 0;
const conflicts = [];
for (const r of rows.slice(1)) {
  if (!Array.isArray(r)) continue;
  const id = String(r[1] ?? '').trim();
  const name = r[2] ?? '';
  if (!id) continue;
  const phone = norm(r[8]);
  if (!phone) continue;
  const emp = byNo.get(id.toUpperCase()) ?? byNo.get(id.toUpperCase().replace(/^[A-Z]+/, ''));
  if (!emp) { skipped++; continue; }
  if (emp.employee_no.toUpperCase() !== id.toUpperCase() && !nameMatches(emp, name)) { skipped++; continue; }
  const existing = emp.phone_number || emp.phone;
  if (!existing) {
    const { error } = await s.from('employees').update({ phone, phone_number: phone }).eq('id', emp.id);
    if (error) { console.log('FAIL', id, error.message); failed++; }
    else updated++;
  } else if (existing === phone) already++;
  else { conflicts.push({ id, empNo: emp.employee_no, existing, sheet: phone }); conflict++; }
}
console.log(`updated: ${updated}, already-same: ${already}, conflicts(kept-existing): ${conflict}, skipped-unmatched: ${skipped}, failed: ${failed}`);
if (conflicts.length) console.log('CONFLICTS:', JSON.stringify(conflicts, null, 1));
