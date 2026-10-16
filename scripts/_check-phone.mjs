import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

const phone = '0531652382';
const intl = '233' + phone.slice(1);

console.log('--- employees with that phone ---');
for (const v of [phone, intl]) {
  const { data } = await s.from('employees')
    .select('id,employee_no,first_name,last_name,email,phone,phone_number')
    .or(`phone.eq.${v},phone_number.eq.${v}`);
  console.log(v, JSON.stringify(data));
}

console.log('--- profiles with that phone ---');
for (const v of [phone, intl]) {
  const { data } = await s.from('profiles')
    .select('id,user_id,employee_id,full_name,role,phone')
    .eq('phone', v);
  console.log(v, JSON.stringify(data));
}
