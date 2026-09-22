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

async function forceDbUpdate() {
  console.log('🔧 Forcing Direct Database Update');
  console.log('==================================\n');

  try {
    // Get actual profile IDs
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    console.log('Current profiles:');
    profiles.forEach(p => {
      console.log(`   ${p.role}: ID=${p.id}, StaffID=${p.employee_id}`);
    });

    // Update by actual ID
    for (const profile of profiles) {
      const newStaffId = profile.role === 'super_admin' ? 'ADMIN001' : 'ADMIN002';
      
      console.log(`\nUpdating ${profile.role} (ID: ${profile.id}):`);
      console.log(`   From: ${profile.employee_id}`);
      console.log(`   To: ${newStaffId}`);

      const { error } = await supabase
        .from('profiles')
        .update({ employee_id: newStaffId })
        .eq('id', profile.id);

      if (error) {
        console.log(`   ❌ Update failed: ${error.message}`);
      } else {
        console.log(`   ✅ Update successful`);
      }
    }

    // Force refresh and verify
    console.log('\n\nVerifying with fresh query:');
    const { data: freshProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    freshProfiles.forEach(p => {
      console.log(`   ${p.role}: ${p.employee_id}`);
    });

    console.log('\n==================================');
    console.log('✅ Database update complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

forceDbUpdate();