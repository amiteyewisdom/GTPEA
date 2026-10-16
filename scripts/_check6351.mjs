import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

const { data: emp } = await s.from('employees').select('id,employee_no,first_name,last_name,phone,phone_number').eq('employee_no', '6351');
console.log('EMP:', JSON.stringify(emp));

if (emp?.[0]) {
  const { data: prof } = await s.from('profiles').select('user_id,employee_id,full_name,role,phone').or(`employee_id.eq.${emp[0].id},employee_id.eq.6351`);
  console.log('PROF:', JSON.stringify(prof));
  const { data: sav } = await s.from('savings').select('id,employee_id,account_number,balance,account_type').eq('employee_id', emp[0].id);
  console.log('SAV:', JSON.stringify(sav));
  const { data: loans } = await s.from('loans').select('id,employee_id,loan_ref,status,outstanding_balance').eq('employee_id', emp[0].id);
  console.log('LOANS:', JSON.stringify(loans));
}
