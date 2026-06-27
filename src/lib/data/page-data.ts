import { createClient } from "@/lib/supabase/server";
import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";
import { formatCurrency, formatDate, formatRelativeTime } from "@/utils/formatters";
import { getSessionProfile, resolveEmployeeUuid } from "./session";

function sum(rows: { [key: string]: unknown }[], field: string) {
  return rows.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
}

export async function fetchFinancialOverview() {
  const stats = await fetchDashboardStats();

  const supabase = await createClient();

  // Pull real repayments, savings contributions, and member charges
  const [repaymentsRes, contributionsRes, chargesRes] = await Promise.all([
    supabase.from("repayments").select("amount_paid, interest_component, status").eq("status", "paid"),
    supabase.from("savings_contributions").select("amount"),
    supabase.from("transactions").select("amount, type").in("type", ["fee", "penalty"]),
  ]);

  const repayments = (repaymentsRes.data ?? []) as any[];
  const contributions = (contributionsRes.data ?? []) as any[];
  const chargeRows = (chargesRes.data ?? []) as any[];

  // Revenue: total repayments received + interest component + fees & penalties collected
  const loanRepayments = repayments.reduce((s, r) => s + (Number(r.amount_paid) || 0), 0);
  const interestCredits = repayments.reduce((s, r) => s + (Number(r.interest_component) || 0), 0);
  const fees = chargeRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const revenueTotal = loanRepayments + interestCredits + fees;

  const breakdown = [
    { label: "Loan Repayments", amount: loanRepayments, color: "bg-brand-success" },
    { label: "Interest Credits", amount: interestCredits, color: "bg-brand-accent" },
    { label: "Fees & Penalties", amount: fees, color: "bg-brand-warning" },
  ].map((item) => ({
    ...item,
    percent: revenueTotal > 0 ? Math.round((item.amount / revenueTotal) * 100) : 0,
  }));

  // Total Assets = member savings (fall back to contributions if balances not set)
  const contributionsTotal = contributions.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const totalAssets = stats.totalSavings > 0 ? stats.totalSavings : contributionsTotal;
  const totalLiabilities = stats.totalLoansOutstanding;
  const netIncome = Math.max(totalAssets - totalLiabilities, 0);

  const growthRate =
    stats.savingsTrend.length >= 2
      ? ((stats.savingsTrend.at(-1)?.savings ?? 0) /
          Math.max(stats.savingsTrend.at(-2)?.savings ?? 1, 1) -
          1) *
        100
      : 0;

  return {
    totalAssets,
    totalLiabilities,
    netIncome,
    growthRate,
    breakdown,
  };
}

export async function fetchFundsData() {
  const stats = await fetchDashboardStats();
  const totalFund = stats.totalSavings;
  const loanPortfolio = stats.totalLoansOutstanding;
  const availableForLoans = stats.fundBalance;
  const reserveFund = Math.max(totalFund * 0.15, 0);
  const investments = Math.max(totalFund - loanPortfolio - reserveFund, 0);

  const allocation = [
    { label: "Loan Portfolio", amount: loanPortfolio, color: "bg-brand-accent" },
    { label: "Investments", amount: investments, color: "bg-brand-success" },
    { label: "Reserves", amount: reserveFund, color: "bg-brand-warning" },
    { label: "Available", amount: availableForLoans, color: "bg-brand-card-border" },
  ].map((item) => ({
    ...item,
    percent: totalFund > 0 ? Math.round((item.amount / totalFund) * 100) : 0,
  }));

  return {
    totalFund,
    investmentReturns: stats.totalDividends,
    availableForLoans,
    reserveFund,
    allocation,
  };
}

export async function fetchMyLoansData() {
  const { supabase, employeeUuid } = await getSessionProfile();
  if (!employeeUuid) {
    return { pending: 0, active: 0, totalBorrowed: 0, loans: [] as any[] };
  }

  const { data: loans } = await supabase
    .from("loans")
    .select("id, loan_ref, status, amount_requested, amount_approved, amount_disbursed, outstanding_balance, purpose, created_at, term_months, loan_products(name)")
    .eq("employee_id", employeeUuid)
    .order("created_at", { ascending: false });

  const rows = (loans ?? []) as any[];
  const totalBorrowed = rows.reduce((s, l) => {
    return s + (Number(l.amount_disbursed) || Number(l.amount_approved) || Number(l.amount_requested) || 0);
  }, 0);
  return {
    pending: rows.filter((l) => l.status === "pending").length,
    active: rows.filter((l) => ["disbursed", "repaying", "approved"].includes(l.status)).length,
    totalBorrowed,
    loans: rows,
  };
}

export async function fetchSavingsHistoryData() {
  const { supabase, employeeUuid } = await getSessionProfile();
  if (!employeeUuid) {
    return { totalSavings: 0, thisMonth: 0, contributions: [] as any[] };
  }

  const now = new Date();
  const [savingsRes, contributionsRes] = await Promise.all([
    supabase.from("savings").select("balance").eq("employee_id", employeeUuid),
    supabase
      .from("savings_contributions")
      .select("id, amount, contribution_type, period_year, period_month, reference, created_at, narration")
      .eq("employee_id", employeeUuid)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const contributions = (contributionsRes.data ?? []) as any[];
  const thisMonth = contributions
    .filter(
      (c) =>
        c.period_year === now.getFullYear() && c.period_month === now.getMonth() + 1
    )
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const savingsBalance = (savingsRes.data ?? []).reduce((s, r: any) => s + (Number(r.balance) || 0), 0);
  const contributionsTotal = contributions.reduce((s, c: any) => s + (Number(c.amount) || 0), 0);
  const totalSavings = savingsBalance > 0 ? savingsBalance : contributionsTotal;

  return {
    totalSavings,
    thisMonth,
    contributions,
  };
}

export async function fetchWithdrawalHistoryData() {
  const { supabase, employeeUuid } = await getSessionProfile();
  if (!employeeUuid) {
    return { totalWithdrawals: 0, thisMonth: 0, withdrawals: [] as any[] };
  }

  const now = new Date();
  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("id, request_ref, amount, status, reason, requested_at, disbursement_date")
    .eq("employee_id", employeeUuid)
    .order("requested_at", { ascending: false });

  const rows = (withdrawals ?? []) as any[];
  const thisMonth = rows
    .filter((w) => {
      const date = new Date(w.requested_at);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    })
    .reduce((acc, w) => acc + (Number(w.amount) || 0), 0);

  return {
    totalWithdrawals: sum(rows.filter((w) => ["approved", "disbursed"].includes(w.status)), "amount"),
    thisMonth,
    withdrawals: rows,
  };
}

export async function fetchRepaymentsData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("repayments")
    .select(`
      id,
      installment_no,
      amount_due,
      amount_paid,
      due_date,
      paid_date,
      status,
      loans (loan_ref),
      employees (first_name, last_name, employee_no)
    `)
    .order("due_date", { ascending: true })
    .limit(200);

  return { repayments: data ?? [] };
}

export async function fetchDisbursementsData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loans")
    .select(`
      id,
      loan_ref,
      amount_disbursed,
      disbursement_date,
      status,
      employees!employee_id (first_name, last_name, employee_no),
      loan_products (name)
    `)
    .not("amount_disbursed", "is", null)
    .gt("amount_disbursed", 0)
    .order("disbursement_date", { ascending: false })
    .limit(200);

  return { disbursements: data ?? [] };
}

export async function fetchAuditLogsData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, table_name, record_id, performed_by, created_at, new_values")
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = await Promise.all(
    (data ?? []).map(async (log: any) => {
      let performer = "System";
      if (log.performed_by) {
        const profileRes = await (supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", log.performed_by)
          .maybeSingle() as any);
        performer = profileRes.data?.full_name ?? "Staff";
      }

      return {
        id: log.id,
        action: log.action,
        tableName: log.table_name,
        performer,
        time: log.created_at ? formatRelativeTime(log.created_at) : "—",
        date: log.created_at ? formatDate(log.created_at) : "—",
        details: log.new_values?.filename
          ? `Imported ${log.new_values.imported ?? 0} rows from ${log.new_values.filename}`
          : `${log.action} on ${log.table_name}`,
      };
    })
  );

  return { logs };
}

export async function fetchUsersData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, employee_id, is_active, created_at, user_id")
    .neq("role", "super_admin")
    .order("created_at", { ascending: false });

  return {
    users: (data ?? []).map((user: any) => ({
      id: user.id,
      name: user.full_name,
      role: user.role,
      employeeId: user.employee_id ?? "—",
      status: user.is_active ? "Active" : "Inactive",
      joined: user.created_at ? formatDate(user.created_at) : "—",
    })),
  };
}

export async function fetchMembersData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employees")
    .select("id, first_name, last_name, employee_no, department, status, email")
    .eq("status", "active")
    .not("email", "eq", "superadmin@gtpea.com")
    .order("last_name", { ascending: true });

  return {
    members: (data ?? []).map((member: any) => ({
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
      employeeNo: member.employee_no,
      department: member.department,
      status: member.status,
      email: member.email,
    })),
  };
}

export async function fetchLedgerSummary() {
  const supabase = await createClient();

  const [savingsRes, loansRes, repaymentsRes, contributionsRes] = await Promise.all([
    supabase.from("savings").select("balance, status"),
    supabase.from("loans").select("amount_approved, amount_requested, outstanding_balance, amount_disbursed, status"),
    supabase.from("repayments").select("amount_paid, status"),
    supabase.from("savings_contributions").select("amount"),
  ]);

  const savings = (savingsRes.data ?? []) as any[];
  const loans = (loansRes.data ?? []) as any[];
  const repayments = (repaymentsRes.data ?? []) as any[];
  const contributions = (contributionsRes.data ?? []) as any[];

  // Credits = money coming INTO the fund: savings deposits + loan repayments paid
  const totalSavingsDeposited = sum(savings, "balance");
  const totalRepaymentsPaid = sum(
    repayments.filter((r) => r.status === "paid"),
    "amount_paid"
  );
  const totalCredits = totalSavingsDeposited + totalRepaymentsPaid;

  // Debits = money going OUT of the fund: loan disbursements
  const totalDebits = loans.reduce((acc, l) => {
    if (!["approved", "disbursed", "repaying", "completed"].includes(l.status)) return acc;
    return acc + (Number(l.amount_disbursed) || Number(l.amount_approved) || Number(l.amount_requested) || 0);
  }, 0);

  // Current balance = total savings in fund minus outstanding loans
  const totalOutstanding = loans.reduce((acc, l) => {
    if (!["approved", "disbursed", "repaying"].includes(l.status)) return acc;
    return acc + (Number(l.outstanding_balance) || Number(l.amount_approved) || Number(l.amount_requested) || 0);
  }, 0);
  const currentBalance = Math.max(totalSavingsDeposited - totalOutstanding, 0);

  return { totalCredits, totalDebits, currentBalance };
}

export async function fetchSystemHealth() {
  const supabase = await createClient();
  const [profilesRes, approvalsRes, auditRes, transactionsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return {
    activeUsers: profilesRes.count ?? 0,
    pendingApprovals: approvalsRes.count ?? 0,
    auditEvents: auditRes.count ?? 0,
    transactionsToday: transactionsRes.count ?? 0,
  };
}

export async function fetchEmployeeTrends(employeeUuid: string | null) {
  if (!employeeUuid) {
    return { savingsChange: undefined, loanChange: undefined };
  }

  const supabase = await createClient();
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [contributionsRes, loansRes] = await Promise.all([
    supabase
      .from("savings_contributions")
      .select("amount, period_year, period_month")
      .eq("employee_id", employeeUuid),
    supabase.from("loans").select("outstanding_balance").eq("employee_id", employeeUuid),
  ]);

  const contributions = (contributionsRes.data ?? []) as any[];

  const currentMonthTotal = contributions
    .filter(
      (c) => c.period_year === now.getFullYear() && c.period_month === now.getMonth() + 1
    )
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const lastMonthTotal = contributions
    .filter(
      (c) =>
        c.period_year === lastMonth.getFullYear() &&
        c.period_month === lastMonth.getMonth() + 1
    )
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const loanBalance = sum((loansRes.data ?? []) as any[], "outstanding_balance");

  return {
    savingsChange:
      currentMonthTotal > 0
        ? `+${formatCurrency(currentMonthTotal - lastMonthTotal)}`
        : undefined,
    loanChange: loanBalance > 0 ? formatCurrency(loanBalance) : undefined,
  };
}
