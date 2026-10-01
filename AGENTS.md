# GTPEA — project notes

## Verification
- Typecheck: `npx tsc --noEmit`
- Lint a file: `npx next lint --file <path>`
- Dev server: `npm run dev` (port 3000 is often held by an unrelated `metatester64` process; Next falls back to 3001)
- DB migrations are applied by pasting `supabase/migrations/*.sql` into the Supabase SQL editor (no CLI link)

## Data model facts
- The system is a record book, not a payment system. Money moves outside it (manual disbursement, payroll deductions). Loans are known only via balance imports; repayments are only recorded when a payroll master file is processed (`src/lib/payroll/process-master-file.ts`).
- `profiles.employee_id` holds the `employees.id` UUID for most accounts (legacy rows may hold an `employee_no`). RLS helper `current_employee_id()` resolves either to an `employee_no` (migration `20261001000200`).
- `guard_profiles_protected_columns` trigger blocks role/is_active/employee_id changes unless the requester is super_admin/administrator or the service role (migration `20261001000000`). BYPASSRLS does not skip triggers.
- **Deployed enums differ from `schema.sql`.** Live `loan_status` lacks `disbursed`/`repaying`; live `transaction_type` uses `interest` (not `interest_credit`) and lacks `penalty`/`dividend_credit`/`savings_adjustment`/`withdrawal_disbursement`. Migration `20261001000300` restores them. **Never use `.in("status", ...)`/`.in("type", ...)` with those literals at DB level** — filter in JS instead (codebase convention since the enum fix).
- Chart of accounts is centralized in `src/lib/reports/gl-accounts.ts` (provenance documented there). Codes also seeded on `loan_products.account_code` and `savings.account_code` by migration `20261001000300`.

## TODO / follow-ups
- [ ] **Negative loan balances from import.** Two active loans have negative `outstanding_balance` / `monthly_repayment` (overpayment artifacts in the source balance sheet): loan ids starting `50524851…` (balance -689.08, repayment -28.71) and `a70b11be…` (balance -978.06, repayment -40.75). The Fund Manager dashboard clamps these to 0 (`fetch-stats.ts`, `expectedCollections` / `collectionForecast`). Decide how to handle: fix in the source import file, mark the loans `completed`, or treat negative balance as a credit owed to the member.
- [ ] Apply pending migrations in Supabase: `20261001000000_guard_profiles_allow_service_role.sql`, `20261001000100_guarantor_status_no_default.sql`, `20261001000200_current_employee_id_resolve_uuid.sql`, `20261001000300_loan_statuses_and_gl_codes.sql` (restores `disbursed`/`repaying` loan statuses — required before loan disbursement and payroll recovery writes will succeed).
- [x] Chairperson / Super Admin dashboards: recovery rate replaced with Collection Rate (last payroll recovery ÷ expected deductions); `loanTrend` now uses only real `amount_disbursed`+`disbursement_date` and paid payroll repayments.
