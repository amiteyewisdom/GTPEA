import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const e = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) e[m[1].trim()] = m[2].trim();
});
const s = createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY);

// All profiles with no employee link or "User" name
const { data: broken } = await s.from('profiles')
  .select('id,user_id,employee_id,full_name,role,phone')
  .or('employee_id.is.null,full_name.eq.User');
console.log('broken profiles:', broken?.length);

const { data: users } = await s.auth.admin.listUsers({ perPage: 2000 });
const byId = new Map((users?.users ?? []).map(u => [u.id, u]));

for (const p of broken ?? []) {
  const authUser = byId.get(p.user_id);
  const email = authUser?.email ?? '';
  const staffId = email.includes('@staff.gtpea.local') ? email.split('@')[0] : null;
  if (!staffId) {
    console.log('SKIP (non-staff email):', p.full_name, p.role, email);
    continue;
  }
  const { data: emp } = await s.from('employees')
    .select('id,first_name,last_name,full_name')
    .eq('employee_no', staffId)
    .maybeSingle();
  if (!emp) {
    console.log('NO-EMPLOYEE:', staffId, p.full_name);
    continue;
  }
  const name = emp.full_name || `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() || p.full_name;
  const { error } = await s.from('profiles')
    .update({ employee_id: emp.id, full_name: name })
    .eq('id', p.id);
  console.log(error ? 'FAIL' : 'FIXED', staffId, '->', name, error?.message ?? '');
}
