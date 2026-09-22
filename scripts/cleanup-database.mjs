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

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDatabase() {
  console.log('🧹 Starting Database Cleanup');
  console.log('============================\n');

  try {
    // Define tables to clean in correct order (respecting foreign key dependencies)
    const cleanupSteps = [
      {
        name: 'OTP Codes',
        table: 'otp_codes',
        description: 'Remove all OTP verification codes'
      },
      {
        name: 'Repayments',
        table: 'repayments',
        description: 'Remove all repayment records'
      },
      {
        name: 'Savings Contributions',
        table: 'savings_contributions',
        description: 'Remove all savings contribution records'
      },
      {
        name: 'Loans',
        table: 'loans',
        description: 'Remove all loan records'
      },
      {
        name: 'Savings',
        table: 'savings',
        description: 'Remove all savings accounts'
      },
      {
        name: 'Pending Employees',
        table: 'pending_employees',
        description: 'Remove all pending employee registrations'
      },
      {
        name: 'Employees',
        table: 'employees',
        description: 'Remove all employee records'
      },
      {
        name: 'Non-admin Profiles',
        table: 'profiles',
        description: 'Remove all user profiles (keeping admin accounts)',
        preserveAdmins: true
      }
    ];

    let totalProcessed = 0;

    for (const step of cleanupSteps) {
      console.log(`🗑️  Cleaning: ${step.name}`);
      console.log(`   ${step.description}`);

      try {
        let result;
        
        if (step.preserveAdmins) {
          // Special handling for profiles to keep admin accounts
          const { data, error } = await supabase
            .from('profiles')
            .delete()
            .not('role', 'in', '(super_admin,administrator)')
            .select();
          
          result = { count: data?.length || 0, error };
        } else {
          // Simple delete with a condition that should match all records
          const { error: deleteError } = await supabase
            .from(step.table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          
          result = { count: 0, error: deleteError };
        }

        if (result.error) {
          // Check if it's a "table not found" error
          if (result.error.message.includes('Could not find the table')) {
            console.log(`   ℹ️  Table does not exist - skipping\n`);
          } else {
            console.log(`   ⚠️  Error: ${result.error.message}`);
            console.log(`   Skipping this table...\n`);
          }
        } else {
          console.log(`   ✅ Cleaned successfully\n`);
          totalProcessed++;
        }
      } catch (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
        console.log(`   Skipping this table...\n`);
      }
    }

    console.log('============================');
    console.log(`✅ Cleanup Complete!`);
    console.log(`📊 Tables processed: ${totalProcessed}/${cleanupSteps.length}`);
    console.log('\n🔄 System is now ready for fresh data import');
    console.log('⚠️  Note: Admin accounts (super_admin, administrator) were preserved');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDatabase();