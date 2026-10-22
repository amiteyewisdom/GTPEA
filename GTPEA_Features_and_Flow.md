# GTPEA Member Portal — Features and Flow

**GTP Employees Association (GTPEA)** — Savings & Loan Records Platform
Web address: https://gtpea.com (also installable on phones as an app)

---

## 1. What the system is

The GTPEA portal is the association's **digital record book** for member savings, loans (called "facilities") and partial withdrawals. It lets members apply and track their own records online, and lets the executives review, approve and report on everything in one place.

Important: the portal **does not move money**. Cash is paid out manually by the Fund Manager, and savings contributions and loan repayments are deducted through **payroll**. The portal records these events so that every balance is accurate and traceable.

---

## 2. User roles

| Role | Who | Main purpose |
|---|---|---|
| **Employee (Member)** | Every staff member | Views own savings and loans, applies for facilities, requests partial withdrawals, acts as guarantor |
| **Fund Manager** | Executive | First approver of loans, approves withdrawals, records disbursements, processes payroll, manages expenses, charges and loan products |
| **Chairperson** | Executive | Second approver of loans; executive dashboard and financial overview |
| **Trustee** | Executive | Third (final) approver of loans; loan reviews and reports |
| **Administrator** | System admin | Manages employees, data imports, loan products, approvals and reports |
| **Super Admin** | System owner | Full access: users, roles, audit logs, funds, system controls (lock logins / maintenance mode), view-as-user support |

---

## 3. Features by role

### 3.1 Employee (Member)
- **Dashboard** — savings balance, active loans, outstanding balance, borrowing capacity and recent activity.
- **Apply for Facility** — choose a loan product, enter amount, term and purpose; the system shows the monthly repayment and checks eligibility automatically.
- **My Loans** — status of every application (waiting for guarantor / Fund Manager / Chairperson / Trustee, approved, rejected, repaying, completed), amortization (repayment) schedule, and **Amend & Resubmit** for rejected applications.
- **Guarantor Requests** — accept or decline requests from colleagues who listed you as guarantor.
- **Savings History** — all savings contributions and balance movements.
- **PW (Partial Withdrawal)** — request a withdrawal from savings and view PW history.
- **Profile** — personal and account details.
- **Settings** — password and active sessions (sign out of other devices).
- **Notifications** — in-app and phone push notifications for every status change.

### 3.2 Fund Manager
- **Dashboard** — fund position, loans outstanding, expected payroll collections and collection forecast.
- **Approvals** — stage 1 review of loan applications; sole approver of partial withdrawals.
- **Disbursements** — record that an approved loan or withdrawal has been paid out (this starts loan repayment and generates the repayment schedule).
- **Repayments** — view repayments recorded from payroll.
- **Data Imports / Payroll** — upload the monthly payroll master file to post savings contributions and loan recoveries.
- **Fund Ledger** — movements of association funds.
- **Expenses** — record fund expenditures (single entry or bulk upload), by category.
- **Member Charges** — record fees and penalties against members.
- **Loan Products** — set up products (interest rate, flat or reducing balance, min/max amount and term).
- **Reports** — see Section 5.

### 3.3 Chairperson
- **Executive Dashboard** — membership, savings, loan portfolio, collection rate and trends.
- **Final Approvals** — stage 2 review of loan applications.
- **Financial Overview** — summary of the association's financial position.
- **Members** — member directory.

### 3.4 Trustee
- **Dashboard** — loans awaiting review and portfolio summary.
- **Loan Reviews** — stage 3 (final board) approval of loan applications.
- **Recommendations** — notes and recommendations on applications.
- **Reports**.

### 3.5 Administrator
- **Dashboard** — system-wide summary.
- **Employees** — add, edit, suspend, reset account (back to default password) or remove members; assign roles.
- **Loans / Savings** — view all member loans and savings accounts.
- **Approvals** — can act on any approval stage when needed.
- **Data Imports** — bulk upload of employees, savings and loan balances (Quick Cash, Hire Purchase, Normal Loans, Lands) from Excel/CSV templates, with validation and result review.
- **Loan Products** and **Reports**.

### 3.6 Super Admin
- **Overview**, **Users**, **Employees**, **Roles & Permissions**, **Loans**, **Savings**, **Funds**, **Reports**.
- **Audit Logs** — every important action (approvals, imports, role changes, system controls) is logged with who did it and when.
- **System Controls** — lock all logins or switch on maintenance mode in an emergency.
- **View as user** — open a member's account to troubleshoot what they see.

---

## 4. Key flows

### 4.1 First-time login
1. Member opens the portal and enters **Staff ID** and the **default password** (shown on the login page).
2. The system asks the member to **set a new password** (minimum 8 characters) and confirm their **phone number**.
3. A **6-digit verification code (OTP)** is sent by SMS to that phone (valid for 5 minutes).
4. Member enters the code → taken to their dashboard.

Ordinary logins after that use **Staff ID + password only** (no OTP).
If an Administrator resets an account, the member goes through steps 1–4 again.
Suspended accounts, or logins during a system lock / maintenance, are blocked with a message.

### 4.2 Loan (facility) application and approval
1. **Member applies** — selects a product, amount, term and purpose. The system checks:
   - Amount and term are within the product's limits.
   - **Borrowing capacity:** maximum = **3 × savings balance** minus all loans already pending, approved or outstanding.
2. **Guarantor check (automatic):**
   - If the member's **savings cover the amount → no guarantor is needed.**
   - Otherwise the member selects **up to 2 guarantors** (active employees). The member's savings plus each guarantor's free savings (savings minus their own loans) must cover the amount.
3. **Guarantor consent** — each guarantor receives a notification and accepts or declines.
   - All must accept for the application to move on.
   - If any guarantor declines, the application is rejected and the member can amend it.
4. **Board approval (in order):**
   1. **Fund Manager** (stage 1)
   2. **Chairperson** (stage 2)
   3. **Trustee** (stage 3 — final)

   At each stage the approver can approve or reject with a reason. The member is notified at every step.
5. **Disbursement** — the Fund Manager pays the money out manually and records it in the portal. The loan becomes **Repaying** and a monthly repayment schedule is generated.
6. **Repayment** — deducted monthly through payroll (see 4.4). When the balance reaches zero the loan is marked **Completed** and borrowing capacity is freed.

**Amend & Resubmit:** a rejected application can be edited (amount, term, purpose). If it was declined by a guarantor it goes back to the guarantor(s); if it was rejected by a board member it resumes at **that same board stage**, not from the beginning.

### 4.3 Partial withdrawal (PW)
1. Member requests an amount from their savings, with a reason (cannot exceed the savings balance).
2. **Fund Manager** approves or rejects (single approval step).
3. Fund Manager pays out manually and records the disbursement; the savings balance is reduced (re-checked at payout).
4. Member is notified. Processing takes a **maximum of 2 weeks**.

### 4.4 Monthly payroll processing
1. Fund Manager / Administrator uploads the **payroll master file** for the month (Staff ID, savings contribution, loan recovery).
2. The system validates every row first (unknown Staff IDs are reported and nothing is posted until fixed).
3. For each member:
   - **Savings contribution** is added to their savings balance.
   - **Loan recovery** is deducted from their active loan balance and recorded as a repayment.
4. The same month cannot be posted twice for a member (duplicate protection).
5. The upload is logged in the audit trail.

### 4.5 Data import (opening balances)
Administrators load existing records from the association's spreadsheets: employees, savings balances and loan balances per product (Quick Cash, Hire Purchase, Normal Loans, Lands). Downloadable templates are provided; the system validates the file and shows a results summary.

### 4.6 Account administration
- **Suspend / reactivate** a member's access.
- **Reset account** — returns the member to the default password and the first-time login flow.
- **Assign roles** — promote a member to Fund Manager, Chairperson, Trustee, Administrator, etc.

---

## 5. Reports
Available as CSV download or printable/PDF view:

- Savings Summary Report
- Loan Disbursement Report
- Repayment Schedule Report
- Employee Status Report
- Default and Risk Report
- Approval Audit Report
- Profit & Loss Statement
- Balance Sheet
- Trial Balance
- Bank Payment Export
- Payroll Export (Savings & Loans) — by month/year

Accounts in the financial reports follow the association's chart of accounts (general ledger codes per loan product and savings type).

---

## 6. Notifications and security
- **Notifications:** in-app bell, phone push notifications and SMS (verification codes).
- **Security:** Staff ID + password login, SMS verification at first login/reset, session management, role-based access (each role only sees its own menus and data), account suspension, emergency system lock, and a full audit log.
- **Mobile:** the portal works on phones and can be installed like an app.

---

## 7. Glossary
- **Facility** — a loan.
- **PW** — Partial Withdrawal from savings.
- **Borrowing capacity** — 3 × savings minus existing loan commitments.
- **Guarantor** — a fellow member whose savings support a loan larger than the borrower's own savings.
- **Disbursement** — recording that approved money has been paid out.
- **Payroll master file** — the monthly payroll deduction file used to post savings and loan recoveries.
