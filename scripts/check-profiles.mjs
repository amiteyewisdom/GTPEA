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

async function checkProfiles() {
  console.log('🔍 Checking test user profiles...\n');

  const testEmails = [
    'kwame.asante@gtpea.test',
    'ama.owusu@gtpea.test',
    'kofi.mensa@gtpea.test',
    'efua.doe@gtpea.test'
  ];

  for (const email of testEmails) {
    try {
      // Find auth user
      let targetUser = null;
      let page = 1;
      const maxPages = 10;

      while (page <= maxPages && !targetUser) {
        const { data: authUser } = await supabase.auth.admin.listUsers({
          page: page,
          perPage: 100,
        });

        targetUser = authUser.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (authUser.users.length < 100) break;
        page++;
      }

      if (!targetUser) {
        console.error(`❌ Auth user not found: ${email}`);
        continue;
      }

      console.log(`\n📧 ${email}`);
      console.log(`   User ID: ${targetUser.id}`);

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUser.id)
        .maybeSingle();

      if (profileError) {
        console.error(`   ❌ Profile error: ${profileError.message}`);
      } else if (profile) {
        console.log(`   ✅ Profile found:`);
        console.log(`      ID: ${profile.id}`);
        console.log(`      Role: ${profile.role}`);
        console.log(`      Employee ID: ${profile.employee_id}`);
        console.log(`      Full Name: ${profile.full_name}`);
      } else {
        console.log(`   ⚠️  No profile found`);
      }

      // Get employee
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (empError) {
        console.error(`   ❌ Employee error: ${empError.message}`);
      } else if (employee) {
        console.log(`   ✅ Employee found:`);
        console.log(`      ID: ${employee.id}`);
        console.log(`      Role: ${employee.role}`);
        console.log(`      Employee No: ${employee.employee_no}`);
      } else {
        console.log(`   ⚠️  No employee found`);
      }

    } catch (error) {
      console.error(`❌ Error checking ${email}:`, error);
    }
  }
}

checkProfiles().catch(console.error);
