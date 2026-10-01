import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local file directly
let supabaseUrl, supabaseServiceKey;

try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');

  for (const line of envLines) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = value;
  }
} catch (error) {
  console.error('Could not read .env.local file:', error.message);
}

supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
supabaseServiceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  { employee_no: 'TEST001', role: 'union_rep' },
  { employee_no: 'TEST002', role: 'fund_manager' },
  { employee_no: 'TEST003', role: 'chairperson' },
  { employee_no: 'TEST004', role: 'employee' }
];

async function fixTestRoles() {
  console.log('🔧 Fixing test user roles...\n');

  for (const testUser of testUsers) {
    try {
      // Get employee record
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, email, first_name, last_name')
        .eq('employee_no', testUser.employee_no)
        .single();

      if (empError || !employee) {
        console.error(`❌ Employee ${testUser.employee_no} not found`);
        continue;
      }

      console.log(`📋 Found employee: ${testUser.employee_no} - ${employee.first_name} ${employee.last_name}`);

      // Find auth user by email
      let targetUser = null;
      let page = 1;
      const maxPages = 10;

      while (page <= maxPages && !targetUser) {
        const { data: authUser } = await supabase.auth.admin.listUsers({
          page: page,
          perPage: 100,
        });

        targetUser = authUser.users.find((u) => u.email.toLowerCase() === employee.email.toLowerCase());

        if (authUser.users.length < 100) break;
        page++;
      }

      if (!targetUser) {
        console.error(`  ❌ Auth user not found for email: ${employee.email}`);
        continue;
      }

      console.log(`  ✅ Found auth user: ${targetUser.email}`);

      // Update profile role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: testUser.role })
        .eq('user_id', targetUser.id);

      if (updateError) {
        console.error(`  ❌ Failed to update profile role: ${updateError.message}`);
      } else {
        console.log(`  ✅ Updated profile role to: ${testUser.role}`);
      }

      // Update employee role for consistency
      const { error: empUpdateError } = await supabase
        .from('employees')
        .update({ role: testUser.role })
        .eq('employee_no', testUser.employee_no);

      if (empUpdateError) {
        console.error(`  ⚠️  Failed to update employee role: ${empUpdateError.message}`);
      } else {
        console.log(`  ✅ Updated employee role to: ${testUser.role}`);
      }

      console.log(`\n✅ ${testUser.employee_no} role set to ${testUser.role}\n`);

    } catch (error) {
      console.error(`❌ Error processing ${testUser.employee_no}:`, error);
    }
  }

  console.log('\n🎉 Role assignment complete!');
  console.log('\nUsers need to log out and log back in for the new roles to take effect.');
}

fixTestRoles().catch(console.error);
