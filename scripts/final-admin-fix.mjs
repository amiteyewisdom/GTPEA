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

async function finalAdminFix() {
  console.log('🔧 Final Admin Account Fix');
  console.log('===========================\n');

  try {
    // Get current admin profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    console.log('Current admin profiles:');
    profiles.forEach(p => {
      console.log(`   ${p.role}: ${p.employee_id} (ID: ${p.id})`);
    });

    // Force update based on actual IDs
    for (const profile of profiles) {
      const newStaffId = profile.role === 'super_admin' ? 'ADMIN001' : 'ADMIN002';
      const newEmail = `${newStaffId.toLowerCase()}@staff.gtpea.local`;

      console.log(`\nUpdating ${profile.role}:`);
      console.log(`   From: ${profile.employee_id}`);
      console.log(`   To: ${newStaffId}`);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ employee_id: newStaffId })
        .eq('id', profile.id);

      if (profileError) {
        console.log(`   ❌ Profile update failed: ${profileError.message}`);
      } else {
        console.log(`   ✅ Profile updated`);
      }

      // Update auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        profile.user_id,
        { email: newEmail }
      );

      if (authError) {
        console.log(`   ⚠️  Auth update: ${authError.message}`);
      } else {
        console.log(`   ✅ Auth updated`);
      }

      // Update employee
      const { error: empError } = await supabase
        .from('employees')
        .update({ 
          employee_no: newStaffId,
          email: newEmail
        })
        .eq('employee_no', profile.employee_id);

      if (empError) {
        console.log(`   ⚠️  Employee update: ${empError.message}`);
      } else {
        console.log(`   ✅ Employee updated`);
      }
    }

    console.log('\n===========================');
    console.log('✅ Final fix complete!');
    console.log('\n📝 Login Credentials:');
    console.log('   Super Admin: ADMIN001');
    console.log('   Administrator: ADMIN002');
    console.log('   Password: Your existing password');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

finalAdminFix();