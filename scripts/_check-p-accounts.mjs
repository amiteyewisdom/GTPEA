import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

// all P-prefixed employees
const { data: pEmps } = await s.from('employees')
  .select('id,employee_no,first_name,last_name,email')
  .ilike('employee_no', 'P%')
  .order('employee_no');
console.log('P-employees:', pEmps?.length);
pEmps?.slice(0, 10).forEach(x => console.log(' ', x.employee_no, '->', x.email, '|', x.first_name, x.last_name));

// P0836 specifically + the 0836 pair
const { data: p0836 } = await s.from('employees').select('*').eq('employee_no', 'P0836').maybeSingle();
console.log('\nP0836:', JSON.stringify(p0836));

// auth users for P-prefixed emails
const { data: users } = await s.auth.admin.listUsers({ perPage: 2000 });
const pAuth = (users?.users ?? []).filter(u => u.email?.match(/^p\d+@staff\.gtpea\.local$/i));
console.log('\nP-auth users:', pAuth.length, pAuth.slice(0, 10).map(u => u.email));

// check if P0836 auth exists
const a = (users?.users ?? []).find(u => u.email === 'p0836@staff.gtpea.local');
console.log('p0836 auth:', a ? a.id : 'NONE');
