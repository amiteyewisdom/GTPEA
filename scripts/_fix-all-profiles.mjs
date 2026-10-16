import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);
const DEFAULT_PW = e.DEFAULT_USER_PASSWORD || 'Gtpea@2026';

// 1. All employees (paginated)
let employees = [];
let from = 0;
while (true) {
  const { data, error } = await s.from('employees')
    .select('id,employee_no,first_name,last_name,email')
    .range(from, from + 999);
  if (error) { console.error('employees fetch:', error.message); break; }
  if (!data?.length) break;
  employees = employees.concat(data);
  if (data.length < 1000) break;
  from += 1000;
}
console.log('employees:', employees.length);

// 2. All auth users (paginated)
let authUsers = [];
let page = 1;
while (true) {
  const { data } = await s.auth.admin.listUsers({ page, perPage: 1000 });
  if (!data?.users?.length) break;
  authUsers = authUsers.concat(data.users);
  if (data.users.length < 1000) break;
  page++;
}
console.log('auth users:', authUsers.length);
const authByEmail = new Map(authUsers.map(u => [u.email?.toLowerCase(), u]));

// 3. All profiles
let profiles = [];
from = 0;
while (true) {
  const { data } = await s.from('profiles').select('id,user_id,employee_id,full_name,role').range(from, from + 999);
  if (!data?.length) break;
  profiles = profiles.concat(data);
  if (data.length < 1000) break;
  from += 1000;
}
const profByUser = new Map(profiles.map(p => [p.user_id, p]));

let created = 0, repaired = 0, alreadyOk = 0, skipped = 0, failed = 0;

for (const emp of employees) {
  const email = (emp.email || `${emp.employee_no.toLowerCase()}@staff.gtpea.local`).toLowerCase();
  const name = `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() || 'User';

  // Ensure auth user exists
  let authUser = authByEmail.get(email);
  if (!authUser) {
    const { data: nu, error: ce } = await s.auth.admin.createUser({
      email,
      password: DEFAULT_PW,
      email_confirm: true,
      user_metadata: { staff_id: emp.employee_no, employee_no: emp.employee_no, full_name: name },
    });
    if (ce) {
      console.log('AUTH-FAIL', emp.employee_no, email, ce.message);
      failed++;
      continue;
    }
    authUser = nu.user;
    created++;
  }

  // Ensure profile exists and is correctly linked
  const prof = profByUser.get(authUser.id);
  if (!prof) {
    const { error: pe } = await s.from('profiles').insert({
      user_id: authUser.id,
      employee_id: emp.id,
      full_name: name,
      role: 'employee',
      must_change_password: true,
      is_active: true,
    });
    if (pe) { console.log('PROF-FAIL', emp.employee_no, pe.message); failed++; }
    else repaired++;
  } else if (!prof.employee_id || prof.full_name === 'User') {
    const { error: pe } = await s.from('profiles')
      .update({ employee_id: emp.id, full_name: name })
      .eq('id', prof.id);
    if (pe) { console.log('PROF-FIX-FAIL', emp.employee_no, pe.message); failed++; }
    else repaired++;
  } else {
    alreadyOk++;
  }
}

console.log(`\nDONE. auth created: ${created}, profiles created/fixed: ${repaired}, already ok: ${alreadyOk}, failed: ${failed}, skipped: ${skipped}`);
