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

async function updateAdminAuth() {
  console.log('🔧 Updating Admin Supabase Auth');
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

    // Define user-friendly staff IDs for admins
    const adminStaffIds = {
      super_admin: 'ADMIN001',
      administrator: 'ADMIN002'
    };

    for (const admin of adminProfiles) {
      console.log(`👤 Admin: ${admin.full_name || 'Unknown'} (${admin.role})`);
      console.log(`   Staff ID: ${admin.employee_id}`);

      const newStaffId = adminStaffIds[admin.role];
      const newEmail = `${newStaffId.toLowerCase()}@staff.gtpea.local`;
      console.log(`   New Auth Email: ${newEmail}`);

      // Update Supabase auth user email
      const { error: authError } = await supabase.auth.admin.updateUserById(
        admin.user_id,
        { email: newEmail }
      );

      if (authError) {
        console.log(`   ⚠️  Could not update auth email: ${authError.message}`);
        console.log(`   ℹ️  You may need to update auth manually or recreate the user\n`);
      } else {
        console.log(`   ✅ Auth email updated successfully\n`);
      }
    }

    console.log('==================================');
    console.log('✅ Admin Auth Update Complete!');
    console.log('\n📝 Admin Login Credentials:');
    console.log('   Super Admin: Staff ID = ADMIN001');
    console.log('   Administrator: Staff ID = ADMIN002');
    console.log('   Password: Your existing password');
    console.log('\n⚠️  If login fails, you may need to recreate the admin users with the new email format.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminAuth();