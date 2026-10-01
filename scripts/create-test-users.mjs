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

// Fallback to process.env
supabaseUrl = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
supabaseServiceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\n   Make sure your .env.local file contains:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testEmployees = [
  {
    employee_no: 'TEST001',
    email: 'kwame.asante@gtpea.test',
    password: 'Test123456!',
    first_name: 'Kwame',
    last_name: 'Asante',
    role: 'employee' // Will be changed to union_rep via dashboard
  },
  {
    employee_no: 'TEST002',
    email: 'ama.owusu@gtpea.test',
    password: 'Test123456!',
    first_name: 'Ama',
    last_name: 'Owusu',
    role: 'employee' // Will be changed to fund_manager via dashboard
  },
  {
    employee_no: 'TEST003',
    email: 'kofi.mensa@gtpea.test',
    password: 'Test123456!',
    first_name: 'Kofi',
    last_name: 'Mensa',
    role: 'employee' // Will be changed to chairperson via dashboard
  },
  {
    employee_no: 'TEST004',
    email: 'efua.doe@gtpea.test',
    password: 'Test123456!',
    first_name: 'Efua',
    last_name: 'Doe',
    role: 'employee' // Stays as employee
  }
];

async function createTestUsers() {
  console.log('Creating test users...\n');

  for (const testUser of testEmployees) {
    try {
      // Get employee record
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('employee_no', testUser.employee_no)
        .single();

      if (empError || !employee) {
        console.error(`❌ Employee ${testUser.employee_no} not found. Run create-test-employees.sql first.`);
        continue;
      }

      console.log(`📋 Found employee: ${testUser.employee_no} - ${employee.first_name} ${employee.last_name}`);

      // Check if auth user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === testUser.email);

      let userId;

      if (existingUser) {
        console.log(`  ✅ Auth user already exists: ${testUser.email}`);
        userId = existingUser.id;
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
            first_name: testUser.first_name,
            last_name: testUser.last_name,
            employee_no: testUser.employee_no
          }
        });

        if (authError) {
          console.error(`  ❌ Failed to create auth user: ${authError.message}`);
          continue;
        }

        userId = authData.user.id;
        console.log(`  ✅ Created auth user: ${testUser.email}`);
      }

      // Update employee with user_id
      const { error: updateEmpError } = await supabase
        .from('employees')
        .update({ user_id: userId })
        .eq('employee_no', testUser.employee_no);

      if (updateEmpError) {
        console.error(`  ❌ Failed to update employee user_id: ${updateEmpError.message}`);
      } else {
        console.log(`  ✅ Linked employee to auth user`);
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({
            full_name: `${testUser.first_name} ${testUser.last_name}`,
            role: testUser.role,
            employee_id: employee.id,
            is_active: true,
            must_change_password: false
          })
          .eq('user_id', userId);

        if (updateProfileError) {
          console.error(`  ❌ Failed to update profile: ${updateProfileError.message}`);
        } else {
          console.log(`  ✅ Updated profile with role: ${testUser.role}`);
        }
      } else {
        // Create new profile
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: `${testUser.first_name} ${testUser.last_name}`,
            role: testUser.role,
            employee_id: employee.id,
            is_active: true,
            must_change_password: false
          });

        if (createProfileError) {
          console.error(`  ❌ Failed to create profile: ${createProfileError.message}`);
        } else {
          console.log(`  ✅ Created profile with role: ${testUser.role}`);
        }
      }

      console.log(`\n✅ ${testUser.employee_no} (${testUser.role}) setup complete\n`);

    } catch (error) {
      console.error(`❌ Error processing ${testUser.employee_no}:`, error);
    }
  }

  console.log('\n🎉 Test users creation complete!');
  console.log('\nLogin credentials (all start as "employee" role):');
  testEmployees.forEach(u => {
    console.log(`  ${u.employee_no}: ${u.email} / Test123456!`);
  });
  console.log('\n📝 Next steps:');
  console.log('1. Log in as Super Admin');
  console.log('2. Go to Employees page');
  console.log('3. Assign roles:');
  console.log('   - TEST001 → union_rep');
  console.log('   - TEST002 → fund_manager');
  console.log('   - TEST003 → chairperson');
  console.log('   - TEST004 → employee (no change)');
  console.log('4. Test the loan approval workflow with these roles');
}

createTestUsers().catch(console.error);
