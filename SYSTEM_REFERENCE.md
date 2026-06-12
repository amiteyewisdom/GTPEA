# GTPEA Finance Platform — System Reference

> GTP Employees Association — Member Savings & Loan Co-operative  
> Last updated: June 2026

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | TailwindCSS + MUI (Material UI) |
| Backend | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| Package Manager | npm (Node.js at `C:\Node.js`) |

---

## 2. Running the App

```powershell
# In the IDE terminal (Windsurf)
$env:Path += ";C:\Node.js"
& "C:\Node.js\npm.cmd" run dev
```

App runs at: **http://localhost:3000**

> **Note:** Node.js is installed at `C:\Node.js` but is not on PATH by default in the IDE terminal.  
> Open a **new** terminal after the first session for PATH to take effect automatically.

---

## 3. Environment Variables

File: `.env.local` (in project root — gitignored, never commit)

```env
NEXT_PUBLIC_SUPABASE_URL=https://fgfoknqwxvvhjrqircdh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HUAT57-cKyGxGDPEbwPtOg_6UmZN-YE
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase Dashboard → Settings → API → service_role>
```

---

## 4. Test Login Credentials

All accounts use password: **`Gtpea@2025`**

| Email | Role | Access |
|---|---|---|
| superadmin@gtpea.com | super_admin | Full system access |
| admin@gtpea.com | administrator | Employee & loan admin |
| chairperson@gtpea.com | chairperson | Executive view, final approvals |
| fundmanager@gtpea.com | fund_manager | Loan reviews, disbursements, ledger |
| unionrep@gtpea.com | union_rep | Loan reviews, employee oversight |
| employee1@gtpea.com | employee | Self-service: loans, savings, profile |
| employee2@gtpea.com | employee | Self-service: loans, savings, profile |

> Change passwords after first login.

---

## 5. Navigation Map by Role

### Super Admin (`/overview`)
- Overview · Users · Roles & Permissions · Loans · Savings · Funds · Reports · Audit Logs · System Settings

### Administrator (`/admin`)
- Dashboard · Employees · Loans · Savings · Approvals · Reports · Data Imports · Settings

### Chairperson (`/executive`)
- Executive Dashboard · Final Approvals · Financial Overview · Meetings · Members

### Fund Manager (`/fund-manager`)
- Dashboard · Loan Reviews · Disbursements · Repayments · Fund Ledger · Reports

### Union Rep (`/union-rep`)
- Dashboard · Loan Reviews · Employees · Recommendations · Reports

### Employee (`/dashboard`)
- Dashboard · Apply Loan · My Loans · Savings History · Withdrawal History · Profile

> **Profile** button appears in sidebar footer for **all** roles → `/profile`

---

## 6. Business Rules

### Fiscal Year
- Runs **December → November** (not calendar year)
- Dividends distributed in December from all interest collected that year

### Savings Lock Period
- Contributions **cannot be changed January–April**
- Changes allowed **May–November only**
- Enforced in both API (`/api/savings/update-contribution`) and UI

### Loan Eligibility
- Max borrowable = **(Total Savings × 3) − Active Loan Balances**
- Shown on loan application form before submission

### Loan Products

| Product | Rate | Calc Method |
|---|---|---|
| Normal Loan | 2% | Reducing balance |
| Hire Purchase | 2.5% | Flat rate (upfront) |
| Quick Cash | 5% | Reducing balance |
| Land Loan | 2% | Reducing balance (up to 4 years) |
| School Fees | 2.5% | Flat rate |
| Car Loan | 2% | Reducing balance |

### Approval Workflow (3 stages)
1. **Stage 1 — Union Rep** reviews and recommends
2. **Stage 2 — Fund Manager** approves disbursement
3. **Stage 3 — Chairperson** gives final approval

---

## 7. Key API Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/loans/apply` | Submit loan application |
| POST | `/api/loans/[id]/process-action` | Approve/reject at each workflow stage |
| POST | `/api/savings/update-contribution` | Change monthly contribution (locked Jan–Apr) |
| POST | `/api/employees/suspend` | Suspend or unsuspend an employee account |
| GET | `/api/dashboard/stats` | Aggregate dashboard statistics |
| POST | `/api/withdrawals/request` | Request savings withdrawal |

---

## 8. Database Reset & Setup

### Full nuclear reset (wipes everything)
Run in **Supabase SQL Editor**:
```
supabase/reset-to-fresh.sql
```

### Recreate test users & loan products
Run after reset:
```
supabase/create-test-users.sql
```

### Schema (tables, RLS policies, functions)
```
supabase/schema.sql
```

### Corrections migration (interest_calc_method, account_code, enum fixes)
```
supabase/migrations/20260612000000_gtpea_corrections.sql
```

---

## 9. Chart of Accounts (Key Codes)

| Account | Code |
|---|---|
| Loans | 62101001 |
| School Fees Loans | 62111001 |
| Hire Purchase | 62121001 |
| Quick Cash | 62131001 |
| Land Loan 1 | 62141001 |
| Land Loan 2 | 62151001 |
| Car Loan | 62161001 |
| Members Savings | 63101001 |
| Interest Payable | 63101002 |
| Dividends | 63101003 |
| Interest on Loans | 11101001 |
| Interest on Quick Cash | 11101002 |
| Interest on School Fees | 11101003 |
| Interest on Car Loans | 11101004 |

---

## 10. Project Structure

```
src/
├── app/
│   ├── (auth)/           # login, forgot-password, reset-password
│   └── (dashboard)/      # all protected pages (one folder per route)
│       ├── layout.tsx    # auth guard + role detection + sidebar
│       ├── dashboard/    # employee dashboard
│       ├── admin/        # administrator dashboard
│       ├── overview/     # super admin dashboard
│       ├── executive/    # chairperson dashboard
│       ├── fund-manager/ # fund manager dashboard
│       ├── union-rep/    # union rep dashboard
│       ├── employees/    # employee management
│       ├── loans/        # all loans list
│       ├── apply-loan/   # employee loan application
│       ├── approvals/    # shared approvals workflow page
│       ├── savings/      # savings management
│       ├── profile/      # user profile (all roles)
│       ├── settings/     # app settings (administrator)
│       └── ...
├── features/             # client components per feature
│   ├── loans/            # LoanApplication.tsx
│   ├── savings/          # SavingsClient.tsx
│   ├── employees/        # EmployeesClient.tsx
│   ├── approvals/        # ApprovalsClient.tsx
│   ├── profile/          # ProfileClient.tsx
│   ├── settings/         # SettingsPage.tsx
│   └── pages/            # thin client wrappers for data pages
├── lib/
│   ├── supabase/         # server.ts, client.ts, admin.ts
│   ├── loans/            # workflow.ts, employee.ts
│   ├── approvals/        # fetch-approvals.ts
│   ├── dashboard/        # fetch-stats.ts
│   ├── data/             # page-data.ts, session.ts
│   └── role-menus.ts     # nav items per role
├── components/
│   ├── layout/           # EnterpriseSidebar, EnterpriseTopbar, EnterpriseLayout
│   ├── data/             # SearchableList, DataTable
│   └── ui/               # GlassCard, StatCard, etc.
└── utils/
    └── formatters.ts     # formatCurrency, calculateMonthlyRepayment, generateAmortizationSchedule
```

---

## 11. Known Limitations / Future Work

- **Car Loan** — product exists but no specialised UI flow yet
- **Consumables** — no inventory table or product-to-loan conversion yet
- **Statement download** — UI exists, backend verification needed
- **Dividends** — calculation and distribution flow not yet automated
- **Payroll deduction import** — Data Imports page exists, needs payroll format spec
