import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

// 1. Auth user exists?
const { data: users } = await s.auth.admin.listUsers({ perPage: 2000 });
const u = users?.users?.find(x => x.email === '6351@staff.gtpea.local');
console.log('AUTH:', JSON.stringify(u ? { id: u.id, email: u.email, created: u.created_at } : null));

if (u) {
  const { data: prof } = await s.from('profiles').select('*').eq('user_id', u.id);
  console.log('PROF-BY-USER:', JSON.stringify(prof));
}

// 2. Savings under employee_no string vs UUID
const { data: s1 } = await s.from('savings').select('id,employee_id,account_number,balance').eq('employee_id', '6351');
console.log('SAV-by-6351:', JSON.stringify(s1));
const { data: s2 } = await s.from('savings').select('id,employee_id,account_number,balance').eq('employee_id', '9687c951-0e5e-4598-8180-0dfe612388df');
console.log('SAV-by-uuid:', JSON.stringify(s2));

// 3. What does employee_id look like in savings generally?
const { data: sample } = await s.from('savings').select('employee_id').limit(5);
console.log('SAMPLE-IDS:', JSON.stringify(sample));

// 4. Account number search for 6351 suffix
const { data: byAcct } = await s.from('savings').select('id,employee_id,account_number,balance').ilike('account_number', '%6351');
console.log('SAV-by-acct:', JSON.stringify(byAcct));
