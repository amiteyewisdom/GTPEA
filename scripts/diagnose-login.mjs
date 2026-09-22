import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseLogin() {
  console.log('🔍 Login System Diagnosis');
  console.log('========================\n');

  try {
    // 1. Check admin profiles
    console.log('1️⃣ Checking Admin Profiles:');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    if (profileError) {
      console.log(`   ❌ Error: ${profileError.message}`);
    } else {
      profiles.forEach(p => {
        console.log(`   ${p.role}:`);
        console.log(`     - Staff ID: ${p.employee_id}`);
        console.log(`     - User ID: ${p.user_id}`);
        console.log(`     - Email: ${p.email || 'Not set'}`);
      });
    }

    // 2. Check employee records
    console.log('\n2️⃣ Checking Employee Records:');
    const { data: employees, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .in('employee_no', ['ADMIN001', 'ADMIN002']);

    if (employeeError) {
      console.log(`   ❌ Error: ${employeeError.message}`);
    } else {
      employees.forEach(e => {
        console.log(`   ${e.employee_no}:`);
        console.log(`     - Name: ${e.first_name} ${e.last_name}`);
        console.log(`     - Email: ${e.email}`);
        console.log(`     - Status: ${e.status}`);
      });
    }

    // 3. Check Supabase auth users
    console.log('\n3️⃣ Checking Supabase Auth Users:');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log(`   ❌ Error: ${authError.message}`);
    } else {
      const adminUsers = users.filter(u => 
        profiles.some(p => p.user_id === u.id)
      );
      
      adminUsers.forEach(u => {
        console.log(`   User ID: ${u.id}`);
        console.log(`     - Email: ${u.email}`);
        console.log(`     - Phone: ${u.phone || 'Not set'}`);
        console.log(`     - Created: ${u.created_at}`);
        console.log(`     - Last Sign In: ${u.last_sign_in_at || 'Never'}`);
      });
    }

    // 4. Test login with admin credentials
    console.log('\n4️⃣ Testing Login Flow:');
    const testStaffId = 'ADMIN001';
    const testEmail = 'admin001@staff.gtpea.local';

    console.log(`   Testing with Staff ID: ${testStaffId}`);
    console.log(`   Expected Auth Email: ${testEmail}`);

    // Check if employee exists
    const { data: testEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_no', testStaffId)
      .single();

    if (testEmployee) {
      console.log(`   ✅ Employee record found`);
      console.log(`     - Employee Email: ${testEmployee.email}`);
    } else {
      console.log(`   ❌ Employee record NOT found`);
    }

    // Check if auth user exists
    const { data: { users: allUsers } } = await supabase.auth.admin.listUsers();
    const authUser = allUsers.find(u => u.email === testEmail);

    if (authUser) {
      console.log(`   ✅ Auth user found`);
      console.log(`     - Auth Email: ${authUser.email}`);
      console.log(`     - Has Password: ${authUser.password ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ❌ Auth user NOT found`);
    }

    // 5. Check for potential issues
    console.log('\n5️⃣ Potential Issues:');
    
    if (!testEmployee) {
      console.log('   ❌ Employee record missing - this will cause login to fail');
    }
    
    if (!authUser) {
      console.log('   ❌ Auth user missing - this will cause login to fail');
    }
    
    if (testEmployee && authUser && testEmployee.email !== authUser.email) {
      console.log('   ⚠️  Email mismatch between employee and auth records');
    }

    console.log('\n========================');
    console.log('✅ Diagnosis complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseLogin();