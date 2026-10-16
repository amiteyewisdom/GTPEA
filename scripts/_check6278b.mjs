import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

// savings by account number containing 6278
const { data: byAcct } = await s.from('savings')
  .select('id,employee_id,account_number,balance,account_type')
  .ilike('account_number', '%6278');
console.log('SAV-by-acct:', JSON.stringify(byAcct));

// savings under literal '6278'
const { data: byNo } = await s.from('savings')
  .select('id,employee_id,account_number,balance')
  .eq('employee_id', '6278');
console.log('SAV-by-no:', JSON.stringify(byNo));

// any duplicate employee row with same name / staff variants
const { data: dupes } = await s.from('employees')
  .select('id,employee_no,first_name,last_name')
  .ilike('employee_no', '%6278');
console.log('DUPES:', JSON.stringify(dupes));

// savings_contributions for him
const { data: contrib } = await s.from('savings_contributions')
  .select('id,savings_id,employee_id,amount')
  .eq('employee_id', '1c087e23-17d4-4dbf-a085-4f42165ef217')
  .limit(5);
console.log('CONTRIB:', JSON.stringify(contrib));
