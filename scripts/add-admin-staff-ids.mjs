import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

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

async function addAdminStaffIds() {
  console.log('🔧 Adding Staff IDs to Admin Accounts');
  console.log('=====================================\n');

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
      console.log(`   Email: ${admin.email || 'Not set'}`);
      console.log(`   Current Staff ID: ${admin.employee_id || 'Not set'}`);

      // Assign user-friendly staff ID
      const staffId = adminStaffIds[admin.role] || `ADMIN${Math.floor(Math.random() * 900) + 100}`;
      
      console.log(`   New Staff ID: ${staffId}`);

      // Update the profile with staff ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ employee_id: staffId })
        .eq('id', admin.id);

      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}\n`);
      } else {
        console.log(`   ✅ Staff ID updated successfully\n`);
      }
    }

    console.log('=====================================');
    console.log('✅ Admin Staff IDs added successfully!');
    console.log('\n📝 Admin Login Credentials:');
    console.log('   Staff ID: Use the Staff ID shown above');
    console.log('   Password: Your existing password');
    console.log('\n⚠️  If you forgot your password, you may need to reset it via the database.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAdminStaffIds();