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

async function getCurrentAdminCreds() {
  console.log('🔍 Getting Current Admin Credentials');
  console.log('====================================\n');

  try {
    // Get admin profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'administrator']);

    // Get employee records
    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .in('employee_no', ['ADMIN001', 'ADMIN002']);

    // Get auth users
    const { data: { users } } = await supabase.auth.admin.listUsers();

    console.log('CURRENT LOGIN CREDENTIALS:\n');

    for (const profile of profiles) {
      console.log(`${profile.role.toUpperCase()}:`);
      console.log(`   Staff ID: ${profile.employee_id}`);
      
      // Find corresponding employee
      const employee = employees.find(e => e.employee_no === profile.employee_id);
      if (employee) {
        console.log(`   Employee Email: ${employee.email}`);
      }
      
      // Find corresponding auth user
      const authUser = users.find(u => u.id === profile.user_id);
      if (authUser) {
        console.log(`   Auth Email: ${authUser.email}`);
        console.log(`   Has Password: ${authUser.password ? 'Yes' : 'No'}`);
      }
      
      console.log('');
    }

    console.log('====================================');
    console.log('📝 Use the Staff ID shown above to login');
    console.log('   Password: Use the password you set or Admin123! if you just reset it');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getCurrentAdminCreds();