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

async function forceAdminFix() {
  console.log('🔧 Force Admin Account Fix');
  console.log('============================\n');

  try {
    // Direct update of admin profiles
    const { error: updateError1 } = await supabase
      .from('profiles')
      .update({ employee_id: 'ADMIN001' })
      .eq('role', 'super_admin');

    if (updateError1) {
      console.log(`❌ Failed to update super_admin: ${updateError1.message}`);
    } else {
      console.log(`✅ Super Admin profile updated to ADMIN001`);
    }

    const { error: updateError2 } = await supabase
      .from('profiles')
      .update({ employee_id: 'ADMIN002' })
      .eq('role', 'administrator');

    if (updateError2) {
      console.log(`❌ Failed to update administrator: ${updateError2.message}`);
    } else {
      console.log(`✅ Administrator profile updated to ADMIN002`);
    }

    // Update employee records
    const { error: empError1 } = await supabase
      .from('employees')
      .update({ 
        employee_no: 'ADMIN001',
        email: 'admin001@staff.gtpea.local'
      })
      .eq('employee_no', 'ADMIN001');

    if (empError1) {
      console.log(`ℹ️  Employee ADMIN001 update error: ${empError1.message}`);
    } else {
      console.log(`✅ Employee ADMIN001 updated`);
    }

    const { error: empError2 } = await supabase
      .from('employees')
      .update({ 
        employee_no: 'ADMIN002',
        email: 'admin002@staff.gtpea.local'
      })
      .eq('employee_no', 'ADMIN002');

    if (empError2) {
      console.log(`ℹ️  Employee ADMIN002 update error: ${empError2.message}`);
    } else {
      console.log(`✅ Employee ADMIN002 updated`);
    }

    // Update Supabase auth
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    for (const profile of profiles) {
      const newEmail = `${profile.employee_id.toLowerCase()}@staff.gtpea.local`;
      const { error: authError } = await supabase.auth.admin.updateUserById(
        profile.user_id,
        { email: newEmail }
      );

      if (authError) {
        console.log(`⚠️  Auth update for ${profile.employee_id}: ${authError.message}`);
      } else {
        console.log(`✅ Auth updated for ${profile.employee_id}`);
      }
    }

    console.log('\n============================');
    console.log('✅ Admin accounts fixed!');
    console.log('\n📝 Login Credentials:');
    console.log('   Super Admin: ADMIN001');
    console.log('   Administrator: ADMIN002');
    console.log('   Password: Your existing password');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceAdminFix();