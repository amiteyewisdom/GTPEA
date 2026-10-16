import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

for (const phone of ['0561641233', '0548098753']) {
  const intl = '233' + phone.slice(1);
  console.log(`\n=== ${phone} ===`);
  for (const v of [phone, intl]) {
    const { data: emps } = await s.from('employees')
      .select('employee_no,first_name,last_name,email,phone,phone_number')
      .or(`phone.eq.${v},phone_number.eq.${v}`);
    for (const r of emps ?? []) console.log('  EMP:', r.employee_no, r.first_name, r.last_name, '|', r.email, '|', v);
    const { data: profs } = await s.from('profiles')
      .select('user_id,full_name,role,phone')
      .eq('phone', v);
    for (const r of profs ?? []) console.log('  PROF:', r.full_name, r.role, '|', v);
  }
}
