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

async function checkAdminStatus() {
  console.log('🔍 Checking Admin Account Status');
  console.log('==================================\n');

  try {
    // Get all admin profiles
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    if (profilesError) {
      throw profilesError;
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('ℹ️  No admin accounts found');
      return;
    }

    console.log(`Found ${adminProfiles.length} admin account(s):\n`);

    for (const admin of adminProfiles) {
      console.log(`👤 Admin: ${admin.full_name || 'Unknown'} (${admin.role})`);
      console.log(`   Profile Staff ID: ${admin.employee_id || 'Not set'}`);
      console.log(`   User ID: ${admin.user_id}`);
      console.log(`   Email: ${admin.email || 'Not set'}`);

      // Check for employee record with current staff ID
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_no', admin.employee_id)
        .single();

      if (employeeError) {
        console.log(`   ❌ No employee record found with current staff ID`);
        
        // Check for employee record with ADMIN001/ADMIN002
        const { data: altEmployee } = await supabase
          .from('employees')
          .select('*')
          .in('employee_no', ['ADMIN001', 'ADMIN002'])
          .single();
        
        if (altEmployee) {
          console.log(`   ✅ Found employee record: ${altEmployee.employee_no}`);
          console.log(`   Employee Email: ${altEmployee.email}`);
        }
      } else {
        console.log(`   ✅ Employee record exists`);
        console.log(`   Employee No: ${employee.employee_no}`);
        console.log(`   Employee Email: ${employee.email}`);
      }

      console.log('');
    }

    console.log('==================================');
    console.log('✅ Status check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdminStatus();