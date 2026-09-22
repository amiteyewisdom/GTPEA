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

async function setAdminPassword() {
  console.log('🔧 Setting Admin Password');
  console.log('=======================\n');

  try {
    // Get admin profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    const defaultPassword = 'Admin123!';

    for (const profile of profiles) {
      console.log(`Setting password for ${profile.role}:`);
      console.log(`   User ID: ${profile.user_id}`);

      const { error } = await supabase.auth.admin.updateUserById(
        profile.user_id,
        { password: defaultPassword }
      );

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Password set to: ${defaultPassword}`);
      }
    }

    console.log('\n=======================');
    console.log('✅ Passwords set successfully!');
    console.log('\n📝 LOGIN CREDENTIALS:');
    console.log('   Super Admin:');
    console.log('     Staff ID: ff80d9c0-093e-42b4-97bd-76f3eaf4194');
    console.log('     Password: Admin123!');
    console.log('   Administrator:');
    console.log('     Staff ID: c319dfd6-8910-42c7d-9929-918b10cf36ac');
    console.log('     Password: Admin123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminPassword();