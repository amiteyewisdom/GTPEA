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

async function fixCompleteLogin() {
  console.log('🔧 Complete Login Fix');
  console.log('====================\n');

  try {
    // Get admin profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    console.log('Updating admin profiles to use correct staff IDs:');
    
    for (const profile of profiles) {
      const newStaffId = profile.role === 'super_admin' ? 'ADMIN001' : 'ADMIN002';
      console.log(`\n${profile.role}:`);
      console.log(`   From: ${profile.employee_id}`);
      console.log(`   To: ${newStaffId}`);

      // Update profile staff ID
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ employee_id: newStaffId })
        .eq('id', profile.id);

      if (profileError) {
        console.log(`   ❌ Profile update failed: ${profileError.message}`);
      } else {
        console.log(`   ✅ Profile staff ID updated`);
      }
    }

    // Set a default password for admin users
    console.log('\n\nSetting default password for admin users:');
    const defaultPassword = 'Admin123!'; // You should change this after first login
    
    for (const profile of profiles) {
      const newStaffId = profile.role === 'super_admin' ? 'ADMIN001' : 'ADMIN002';
      const newEmail = `${newStaffId.toLowerCase()}@staff.gtpea.local`;
      
      console.log(`\n${newStaffId}:`);
      console.log(`   Email: ${newEmail}`);
      console.log(`   Setting password: ${defaultPassword}`);

      // Update auth user password
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        profile.user_id,
        { password: defaultPassword }
      );

      if (passwordError) {
        console.log(`   ❌ Password update failed: ${passwordError.message}`);
      } else {
        console.log(`   ✅ Password set successfully`);
      }
    }

    console.log('\n\n====================');
    console.log('✅ Login fix complete!');
    console.log('\n📝 NEW LOGIN CREDENTIALS:');
    console.log('   Super Admin:');
    console.log('     Staff ID: ADMIN001');
    console.log('     Password: Admin123!');
    console.log('   Administrator:');
    console.log('     Staff ID: ADMIN002');
    console.log('     Password: Admin123!');
    console.log('\n⚠️  IMPORTANT: Change your password after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCompleteLogin();