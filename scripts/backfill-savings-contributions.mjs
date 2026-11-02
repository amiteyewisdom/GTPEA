/**
 * Backfill script to create savings_contributions records for existing savings balances
 * that were imported before the contribution tracking was added.
 *
 * This script:
 * 1. Finds all savings accounts with no contributions
 * 2. Creates a contribution record for each with the current balance
 * 3. Uses the savings account's opened_at date (or current date) as the period
 *
 * Usage: node scripts/backfill-savings-contributions.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function backfillSavingsContributions() {
  console.log('Starting backfill of savings contributions...');

  // Get all savings accounts
  const { data: savings, error: savingsError } = await supabase
    .from('savings')
    .select('id, employee_id, balance, account_number, opened_at')
    .order('opened_at', { ascending: true });

  if (savingsError) {
    console.error('Error fetching savings:', savingsError);
    process.exit(1);
  }

  console.log(`Found ${savings.length} savings accounts`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const saving of savings) {
    try {
      // Check if this savings account already has contributions
      const { data: existingContributions, error: checkError } = await supabase
        .from('savings_contributions')
        .select('id')
        .eq('savings_id', saving.id)
        .limit(1);

      if (checkError) {
        console.error(`Error checking contributions for ${saving.account_number}:`, checkError);
        errors++;
        continue;
      }

      if (existingContributions && existingContributions.length > 0) {
        console.log(`Skipping ${saving.account_number} - already has contributions`);
        skipped++;
        continue;
      }

      // Use the opened_at date as the period, or current date if not available
      const openedDate = saving.opened_at ? new Date(saving.opened_at) : new Date();
      const periodYear = openedDate.getFullYear();
      const periodMonth = openedDate.getMonth() + 1;

      // Create contribution record
      const contributionReference = `BACKFILL-${periodYear}${String(periodMonth).padStart(2, '0')}-${saving.account_number}`;
      const { error: insertError } = await supabase
        .from('savings_contributions')
        .insert({
          savings_id: saving.id,
          employee_id: saving.employee_id,
          amount: Number(saving.balance) || 0,
          contribution_type: 'adjustment',
          period_year: periodYear,
          period_month: periodMonth,
          reference: contributionReference,
          narration: 'Backfill contribution from initial import',
        });

      if (insertError) {
        console.error(`Error creating contribution for ${saving.account_number}:`, insertError);
        errors++;
      } else {
        console.log(`✓ Created contribution for ${saving.account_number}: GH₵${saving.balance} (${periodYear}-${String(periodMonth).padStart(2, '0')})`);
        processed++;
      }
    } catch (error) {
      console.error(`Error processing ${saving.account_number}:`, error);
      errors++;
    }
  }

  console.log('\n=== Backfill Complete ===');
  console.log(`Processed: ${processed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
}

backfillSavingsContributions()
  .then(() => {
    console.log('Backfill completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  });
