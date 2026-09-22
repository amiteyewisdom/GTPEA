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

async function fixAdminStaffIds() {
  console.log('🔧 Fixing Admin Staff IDs');
  console.log('===========================\n');

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

    // Define user-friendly staff IDs for admins
    const adminStaffIds = {
      super_admin: 'ADMIN001',
      administrator: 'ADMIN002'
    };

    for (const admin of adminProfiles) {
      console.log(`👤 Admin: ${admin.full_name || 'Unknown'} (${admin.role})`);
      console.log(`   Current Staff ID: ${admin.employee_id || 'Not set'}`);

      // Assign user-friendly staff ID
      const newStaffId = adminStaffIds[admin.role];
      console.log(`   New Staff ID: ${newStaffId}`);

      // Update the profile with staff ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ employee_id: newStaffId })
        .eq('id', admin.id);

      if (updateError) {
        console.log(`   ❌ Failed to update profile: ${updateError.message}\n`);
      } else {
        console.log(`   ✅ Profile updated successfully`);
      }

      // Check if employee record exists with new staff ID
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_no', newStaffId)
        .single();

      if (existingEmployee) {
        // Update existing employee record
        const { error: updateEmployeeError } = await supabase
          .from('employees')
          .update({
            email: `${newStaffId.toLowerCase()}@staff.gtpea.local`,
            password_changed_at: new Date().toISOString()
          })
          .eq('employee_no', newStaffId);

        if (updateEmployeeError) {
          console.log(`   ❌ Failed to update employee: ${updateEmployeeError.message}\n`);
        } else {
          console.log(`   ✅ Employee record updated successfully\n`);
        }
      } else {
        // Create new employee record
        const { error: insertError } = await supabase
          .from('employees')
          .insert({
            employee_no: newStaffId,
            first_name: admin.full_name?.split(' ')[0] || 'Admin',
            last_name: admin.full_name?.split(' ').slice(1).join(' ') || 'User',
            email: `${newStaffId.toLowerCase()}@staff.gtpea.local`,
            phone: admin.phone || null,
            department: 'management',
            position: admin.role === 'super_admin' ? 'Super Administrator' : 'Administrator',
            bank_account_no: null,
            date_joined: new Date().toISOString().slice(0, 10),
            salary: 0,
            status: 'active',
            password_changed_at: new Date().toISOString()
          });

        if (insertError) {
          console.log(`   ❌ Failed to create employee: ${insertError.message}\n`);
        } else {
          console.log(`   ✅ Employee record created successfully\n`);
        }
      }
    }

    console.log('===========================');
    console.log('✅ Admin Staff IDs fixed!');
    console.log('\n📝 Admin Login Credentials:');
    console.log('   Super Admin: Staff ID = ADMIN001');
    console.log('   Administrator: Staff ID = ADMIN002');
    console.log('   Password: Your existing password');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdminStaffIds();