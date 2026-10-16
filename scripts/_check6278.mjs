import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

const { data: emp } = await s.from('employees')
  .select('id,employee_no,first_name,last_name,phone')
  .eq('employee_no', '6278').maybeSingle();
console.log('EMP:', JSON.stringify(emp));

const { data: users } = await s.auth.admin.listUsers({ perPage: 2000 });
const u = users?.users?.find(x => x.email === '6278@staff.gtpea.local');
console.log('AUTH:', u ? u.id : 'none');

if (u) {
  const { data: prof } = await s.from('profiles').select('id,employee_id,full_name,phone').eq('user_id', u.id).maybeSingle();
  console.log('PROF:', JSON.stringify(prof));
  if (prof && emp && (!prof.employee_id || prof.full_name === 'User')) {
    const name = `${emp.first_name} ${emp.last_name}`.trim();
    const { error } = await s.from('profiles')
      .update({ employee_id: emp.id, full_name: name })
      .eq('id', prof.id);
    console.log(error ? 'FIX FAILED: ' + error.message : `FIXED -> ${name}`);
  } else if (prof) {
    console.log('profile OK');
  }
}

if (emp) {
  const { data: sav } = await s.from('savings').select('account_number,balance,account_type').eq('employee_id', emp.id);
  console.log('SAV:', JSON.stringify(sav));
  const { data: loans } = await s.from('loans').select('loan_ref,status,outstanding_balance').eq('employee_id', emp.id);
  console.log('LOANS:', JSON.stringify(loans));
}
