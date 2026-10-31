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
- Loan board order is Fund Manager (stage 1) → Chairperson (stage 2) → Trustee (`union_rep`, stage 3) → Fund Manager manual disbursement.
- Guarantors are automatic for active employees. A loan needs no guarantor when borrower savings cover the request; otherwise at most two guarantors are allowed, all must consent, and borrower savings plus each guarantor's savings minus committed/outstanding loans must cover the request.
- OTP is only for first-login or administrator-reset password setup; ordinary logins use staff ID and password without OTP.
- **Staff IDs were renumbered Oct 2026** (Sep26 records file): every `employee_no` is now `T####` (Tsg) or `P####` (Pat) prefixed; 7 members were fully renumbered (e.g. P0770→P1361). Login accepts both formats (prefix fallback in `/api/auth/login`). Emails/UUIDs unchanged. Applied by `scripts/_sep26-update.mjs` — parses `GTPEA Data - Sep26 29.10.2026.xlsx` (CU - Sep26 sheet), updates balances + monthly deductions, logs deltas to `savings_adjustments` / `repayments` (`payment_method='adjustment'`). Orange-highlighted cells are readable via `XLSX.readFile(..., {cellStyles:true})`.
- Monthly savings contributions: members change via Savings History page → `/api/savings/update-contribution` (locked Jan–Apr, notifies fund managers, syncs `employees.monthly_savings`). Payroll master export prefills `savings.monthly_contribution` + loan `monthly_repayment`.

## TODO / follow-ups
- [ ] **Negative loan balances from import.** Two active loans have negative `outstanding_balance` / `monthly_repayment`: `LAND-T0810` (-689.08) and `LAND-T0648` (-978.06), plus a trivial `SCHOOL-T1214` (-0.35). Neither member has a Land row in the Sep26 records, so these are likely settled loans — candidate to mark `completed` (or treat the negative as member credit). Fund Manager dashboard clamps to 0.
- [x] Migrations `20261001000000`–`20261002000000` confirmed applied in Supabase (enum values, account codes, no phantom guarantors verified Oct 2026).
- [x] Chairperson / Super Admin dashboards: recovery rate replaced with Collection Rate (last payroll recovery ÷ expected deductions); `loanTrend` now uses only real `amount_disbursed`+`disbursement_date` and paid payroll repayments.
