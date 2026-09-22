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

async function syncAdminEmployees() {
  console.log('🔄 Syncing Admin Accounts to Employees Table');
  console.log('=============================================\n');

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
      console.log(`👤 Processing: ${admin.full_name || 'Unknown'} (${admin.role})`);
      console.log(`   Staff ID: ${admin.employee_id}`);

      // Check if admin exists in employees table
      const { data: existingEmployee, error: checkError } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_no', admin.employee_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected
        console.log(`   ⚠️  Error checking employee: ${checkError.message}`);
        continue;
      }

      if (existingEmployee) {
        console.log(`   ✅ Already exists in employees table\n`);
        continue;
      }

      // Add admin to employees table
      const { error: insertError } = await supabase
        .from('employees')
        .insert({
          employee_no: admin.employee_id,
          first_name: admin.full_name?.split(' ')[0] || 'Admin',
          last_name: admin.full_name?.split(' ').slice(1).join(' ') || 'User',
          email: `${admin.employee_id.toLowerCase()}@staff.gtpea.local`,
          phone: admin.phone || null,
          department: 'management',
          position: admin.role === 'super_admin' ? 'Super Administrator' : 'Administrator',
          bank_account_no: null,
          date_joined: new Date().toISOString().slice(0, 10),
          salary: 0,
          status: 'active',
          password_changed_at: new Date().toISOString() // Mark as not first login
        });

      if (insertError) {
        console.log(`   ❌ Failed to add to employees: ${insertError.message}\n`);
      } else {
        console.log(`   ✅ Added to employees table successfully\n`);
      }
    }

    console.log('=============================================');
    console.log('✅ Admin accounts synced to employees table!');
    console.log('\n📝 You can now login using:');
    console.log('   Staff ID: ADMIN001 (Super Admin) or ADMIN002 (Administrator)');
    console.log('   Password: Your existing password');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncAdminEmployees();