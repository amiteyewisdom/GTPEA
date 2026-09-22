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

async function forceProfileUpdate() {
  console.log('🔧 Forcing Profile Staff ID Update');
  console.log('==================================\n');

  try {
    // Direct SQL update for profiles
    const { error: sqlError1 } = await supabase.rpc('exec_sql', {
      sql: "UPDATE profiles SET employee_id = 'ADMIN001' WHERE role = 'super_admin';"
    });

    if (sqlError1) {
      console.log(`⚠️  SQL update failed, trying Supabase client...`);
      
      // Fallback to Supabase client
      const { error: fallbackError1 } = await supabase
        .from('profiles')
        .update({ employee_id: 'ADMIN001' })
        .eq('role', 'super_admin');
      
      if (fallbackError1) {
        console.log(`❌ Failed to update super_admin: ${fallbackError1.message}`);
      } else {
        console.log(`✅ Super Admin profile updated to ADMIN001`);
      }
    } else {
      console.log(`✅ Super Admin profile updated to ADMIN001`);
    }

    const { error: sqlError2 } = await supabase.rpc('exec_sql', {
      sql: "UPDATE profiles SET employee_id = 'ADMIN002' WHERE role = 'administrator';"
    });

    if (sqlError2) {
      console.log(`⚠️  SQL update failed, trying Supabase client...`);
      
      const { error: fallbackError2 } = await supabase
        .from('profiles')
        .update({ employee_id: 'ADMIN002' })
        .eq('role', 'administrator');
      
      if (fallbackError2) {
        console.log(`❌ Failed to update administrator: ${fallbackError2.message}`);
      } else {
        console.log(`✅ Administrator profile updated to ADMIN002`);
      }
    } else {
      console.log(`✅ Administrator profile updated to ADMIN002`);
    }

    // Verify the updates
    console.log('\nVerifying updates:');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    profiles.forEach(p => {
      console.log(`${p.role}: ${p.employee_id}`);
    });

    console.log('\n==================================');
    console.log('✅ Profile update complete!');
    console.log('\n📝 Login Credentials:');
    console.log('   Staff ID: ADMIN001 (Super Admin)');
    console.log('   Staff ID: ADMIN002 (Administrator)');
    console.log('   Password: Admin123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceProfileUpdate();