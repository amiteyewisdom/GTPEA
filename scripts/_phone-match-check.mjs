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

// load all employees
let emps = [];
let from = 0;
while (true) {
  const { data } = await s.from('employees').select('id,employee_no,first_name,last_name').range(from, from + 999);
  if (!data?.length) break;
  emps = emps.concat(data);
  if (data.length < 1000) break;
  from += 1000;
}
const byNo = new Map(emps.map(x => [x.employee_no.toUpperCase(), x]));

const normName = n => String(n || '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
function nameMatches(emp, sheetName) {
  const a = new Set(`${emp.first_name} ${emp.last_name}`.toLowerCase().split(/\s+/));
  const b = new Set(normName(sheetName).split(' '));
  b.delete('jnr'); b.delete('snr'); b.delete('jr'); b.delete('sr');
  let common = 0;
  for (const w of b) if (w.length > 2 && a.has(w)) common++;
  return common;
}

let exact = 0, strippedNameOk = 0, strippedNameFail = 0, noMatch = 0;
const fails = [], nos = [];
for (const r of rows.slice(1)) {
  if (!Array.isArray(r)) continue;
  const id = String(r[1] ?? '').trim();
  const name = r[2] ?? '';
  if (!id) continue;
  if (byNo.has(id.toUpperCase())) { exact++; continue; }
  const stripped = id.replace(/^[A-Z]+/, '');
  const emp = byNo.get(stripped);
  if (!emp) { noMatch++; nos.push(`${id} ${name}`); continue; }
  const common = nameMatches(emp, name);
  if (common >= 1) strippedNameOk++;
  else { strippedNameFail++; fails.push({ id, name, empName: `${emp.first_name} ${emp.last_name}`, empNo: emp.employee_no }); }
}
console.log(`exact: ${exact}, strip+nameOK: ${strippedNameOk}, strip+nameMISMATCH: ${strippedNameFail}, noMatch: ${noMatch}`);
console.log('\nMISMATCHES:', JSON.stringify(fails.slice(0, 40), null, 1));
console.log('\nNO MATCH:', nos.slice(0, 40).join(' | '));
