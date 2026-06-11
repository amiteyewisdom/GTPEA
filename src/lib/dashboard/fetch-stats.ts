import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildLoanApprovalQueue } from "@/lib/approvals/build-queue";
import { resolveEmployeeUuid } from "@/lib/data/session";
import { formatCurrency, formatDate, formatRelativeTime } from "@/utils/formatters";
import { format, subMonths } from "date-fns";

const LOAN_COLORS = ["#b59a6d", "#2D7A4D", "#F59E0B", "#DC2626", "#6366F1", "#8B5CF6"];

function sum(rows: { [key: string]: unknown }[], field: string): number {
  return rows.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
}

function lastMonths(count: number): { key: string; label: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const date = subMonths(new Date(), count - 1 - i);
    return { key: format(date, "yyyy-MM"), label: format(date, "MMM") };
  });
}

export interface DashboardStats {
  totalEmployees: number;
  totalSavings: number;
  totalLoansOutstanding: number;
  totalLoansDisbursed: number;
  fundBalance: number;
  pendingApprovals: number;
  pendingLoans: number;
  approvedLoans: number;
  totalWithdrawals: number;
  totalDividends: number;
  activeUsers: number;
  savingsTrend: { month: string; savings: number }[];
  loanDistribution: { name: string; value: number; color: string }[];
  loanTrend: { month: string; disbursements: number; repayments: number }[];
  recentActivity: { id: string; title: string; description: string; time: string }[];
  approvalQueue: {
    id: string;
    type: string;
    requester: string;
    amount: string;
    status: string;
    time: string;
  }[];
  upcomingRepayments: {
    id: string;
    borrower: string;
    amount: string;
    amountValue: number;
    dueDate: string;
    status: string;
  }[];
  pendingLoanReviews: {
    approvalId: string;
    id: string;
    applicant: string;
    amount: string;
    duration: string;
    purpose: string;
    riskScore: string;
    currentStage: number;
    totalStages: number;
  }[];
  chairpersonQueue: {
    approvalId: string;
    id: string;
    applicant: string;
    amount: string;
    duration: string;
    purpose: string;
    riskScore: string;
    currentStage: number;
    totalStages: number;
  }[];
  recentDisbursements: {
    id: string;
    recipient: string;
    amount: string;
    loanId: string;
    date: string;
    status: string;
  }[];
  employeeSummaries: {
    id: string;
    name: string;
    savings: string;
    loans: string;
    balance: string;
    dividends: string;
    withdrawals: string;
  }[];
  unionRepStats: {
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
  };
  unionRepLoans: {
    approvalId: string;
    id: string;
    name: string;
    employeeId: string;
    currentSavings: string;
    currentLoans: string;
    monthlyRepayments: string;
    loanHistory: string;
    eligibilityScore: number;
    status: "eligible" | "review" | "caution" | "ineligible";
  }[];
  recentRecommendations: {
    employee: string;
    action: string;
    amount: string;
    date: string;
    status: string;
  }[];
  recentOperations: {
    action: string;
    description: string;
    time: string;
    status: string;
  }[];
  auditLogCount: number;
  transactionsToday: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const months = lastMonths(6);

  const [
    employeesRes,
    savingsRes,
    loansRes,
    approvalsRes,
    withdrawalsRes,
    dividendsRes,
    profilesRes,
    transactionsRes,
    repaymentsRes,
    contributionsRes,
    approvalActionsRes,
    auditCountRes,
    transactionsTodayRes,
  ] = await Promise.all([
    supabase.from("employees").select("id, first_name, last_name, status"),
    supabase.from("savings").select("id, employee_id, balance, status").eq("status", "active"),
    supabase
      .from("loans")
      .select(
        "id, loan_ref, employee_id, amount_requested, amount_approved, amount_disbursed, outstanding_balance, status, purpose, term_months, monthly_repayment, disbursement_date, created_at, loan_product_id, employees!employee_id(first_name, last_name), loan_products(name)"
      ),
    supabase
      .from("approvals")
      .select("id, entity_type, entity_id, status, submitted_at, submitted_by, current_stage, total_stages")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(20),
    supabase
      .from("withdrawal_requests")
      .select("id, employee_id, amount, status, employees(first_name, last_name)"),
    supabase
      .from("dividends")
      .select("id, employee_id, dividend_amount, credited_at")
      .not("credited_at", "is", null),
    supabase.from("profiles").select("id").eq("is_active", true),
    supabase
      .from("transactions")
      .select("id, type, description, amount, created_at, employee_id, employees(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("repayments")
      .select("id, amount_due, due_date, status, employees(first_name, last_name)")
      .in("status", ["pending", "overdue"])
      .order("due_date", { ascending: true })
      .limit(6),
    supabase
      .from("savings_contributions")
      .select("amount, period_year, period_month, created_at")
      .gte("created_at", subMonths(new Date(), 6).toISOString()),
    supabase
      .from("approval_actions")
      .select("id, action, actioned_at, approval_id, approvals(entity_type, entity_id)")
      .order("actioned_at", { ascending: false })
      .limit(20),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  for (const [label, result] of [
    ["employees", employeesRes],
    ["savings", savingsRes],
    ["loans", loansRes],
    ["withdrawals", withdrawalsRes],
    ["dividends", dividendsRes],
  ] as const) {
    if (result.error) {
      console.error(`[fetchDashboardStats] ${label} query failed:`, result.error.message);
    }
  }

  const employees = (employeesRes.data || []) as any[];
  const savings = (savingsRes.data || []) as any[];
  const loans = (loansRes.data || []) as any[];
  const approvals = (approvalsRes.data || []) as any[];
  const withdrawals = (withdrawalsRes.data || []) as any[];
  const dividends = (dividendsRes.data || []) as any[];
  const transactions = (transactionsRes.data || []) as any[];
  const repayments = (repaymentsRes.data || []) as any[];
  const contributions = (contributionsRes.data || []) as any[];
  const approvalActions = (approvalActionsRes.data || []) as any[];

  const activeEmployees = employees.filter((e) => e.status === "active");
  const totalSavings = sum(savings, "balance");
  const totalLoansOutstanding = sum(
    loans.filter((l) => ["disbursed", "repaying", "approved"].includes(l.status)),
    "outstanding_balance"
  );
  const totalLoansDisbursed = sum(loans, "amount_disbursed");
  const pendingLoans = loans.filter((l) => l.status === "pending").length;
  const approvedLoans = loans.filter((l) =>
    ["approved", "disbursed", "repaying", "completed"].includes(l.status)
  ).length;
  const totalWithdrawals = sum(
    withdrawals.filter((w) => ["approved", "disbursed"].includes(w.status)),
    "amount"
  );
  const totalDividends = sum(dividends, "dividend_amount");

  const savingsByEmployee = savings.reduce<Record<string, number>>((acc, row) => {
    acc[row.employee_id] = (acc[row.employee_id] || 0) + (Number(row.balance) || 0);
    return acc;
  }, {});

  const loansByEmployee = loans.reduce<Record<string, { total: number; outstanding: number; count: number }>>(
    (acc, loan) => {
      const current = acc[loan.employee_id] || { total: 0, outstanding: 0, count: 0 };
      current.total += Number(loan.amount_approved || loan.amount_requested) || 0;
      current.outstanding += Number(loan.outstanding_balance) || 0;
      current.count += 1;
      acc[loan.employee_id] = current;
      return acc;
    },
    {}
  );

  const dividendsByEmployee = dividends.reduce<Record<string, number>>((acc, row) => {
    acc[row.employee_id] = (acc[row.employee_id] || 0) + (Number(row.dividend_amount) || 0);
    return acc;
  }, {});

  const withdrawalsByEmployee = withdrawals.reduce<Record<string, number>>((acc, row) => {
    acc[row.employee_id] = (acc[row.employee_id] || 0) + (Number(row.amount) || 0);
    return acc;
  }, {});

  const savingsTrend = months.map(({ key, label }) => {
    const [year, month] = key.split("-").map(Number);
    const total = contributions
      .filter((c) => c.period_year === year && c.period_month === month)
      .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    return { month: label, savings: total };
  });

  const productTotals = loans.reduce<Record<string, number>>((acc, loan) => {
    const name = loan.loan_products?.name || "Other";
    acc[name] = (acc[name] || 0) + (Number(loan.amount_approved || loan.amount_requested) || 0);
    return acc;
  }, {});

  const loanDistribution = Object.entries(productTotals).map(([name, value], index) => ({
    name,
    value,
    color: LOAN_COLORS[index % LOAN_COLORS.length],
  }));

  const loanTrend = months.map(({ key, label }) => {
    const [year, month] = key.split("-").map(Number);
    const disbursements = loans
      .filter((loan) => {
        if (!loan.disbursement_date) return false;
        const date = new Date(loan.disbursement_date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      })
      .reduce((acc, loan) => acc + (Number(loan.amount_disbursed) || 0), 0);

    const monthRepayments = repayments
      .filter((r) => {
        const date = new Date(r.due_date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      })
      .reduce((acc, r) => acc + (Number(r.amount_due) || 0), 0);

    return { month: label, disbursements, repayments: monthRepayments };
  });

  const loanMap = new Map(loans.map((loan) => [loan.id, loan]));
  const withdrawalMap = new Map(withdrawals.map((withdrawal) => [withdrawal.id, withdrawal]));
  const employeeName = (loan: any) =>
    `${loan.employees?.first_name || ""} ${loan.employees?.last_name || ""}`.trim() || "Unknown";
  const withdrawalEmployeeName = (withdrawal: any) =>
    `${withdrawal.employees?.first_name || ""} ${withdrawal.employees?.last_name || ""}`.trim() || "Unknown";

  const approvalQueue = approvals.slice(0, 5).map((approval) => {
    const loan = approval.entity_type === "loan" ? loanMap.get(approval.entity_id) : null;
    const withdrawal =
      approval.entity_type === "withdrawal" ? withdrawalMap.get(approval.entity_id) : null;

    return {
      id: approval.id,
      type: approval.entity_type === "loan" ? "Loan" : "Withdrawal",
      requester: loan
        ? employeeName(loan)
        : withdrawal
          ? withdrawalEmployeeName(withdrawal)
          : "—",
      amount: loan
        ? formatCurrency(Number(loan.amount_requested) || 0)
        : withdrawal
          ? formatCurrency(Number(withdrawal.amount) || 0)
          : formatCurrency(0),
      status: "Pending",
      time: approval.submitted_at ? formatRelativeTime(approval.submitted_at) : "—",
    };
  });

  const fundManagerQueue = buildLoanApprovalQueue(approvals, loans, 2);
  const chairpersonQueueItems = buildLoanApprovalQueue(approvals, loans, 3);
  const unionRepQueue = buildLoanApprovalQueue(approvals, loans, 1);

  const pendingLoanReviews = fundManagerQueue.slice(0, 6).map((item) => ({
    approvalId: item.approvalId,
    id: item.loanId,
    applicant: item.applicant,
    amount: item.amount,
    duration: item.duration,
    purpose: item.purpose,
    riskScore: item.riskScore,
    currentStage: item.currentStage,
    totalStages: item.totalStages,
  }));

  const chairpersonQueue = chairpersonQueueItems.slice(0, 6).map((item) => ({
    approvalId: item.approvalId,
    id: item.loanId,
    applicant: item.applicant,
    amount: item.amount,
    duration: item.duration,
    purpose: item.purpose,
    riskScore: item.riskScore,
    currentStage: item.currentStage,
    totalStages: item.totalStages,
  }));

  const recentDisbursements = loans
    .filter((loan) => loan.amount_disbursed && loan.disbursement_date)
    .slice(0, 4)
    .map((loan) => ({
      id: loan.id,
      recipient: employeeName(loan),
      amount: formatCurrency(Number(loan.amount_disbursed) || 0),
      loanId: loan.loan_ref,
      date: formatDate(loan.disbursement_date),
      status: loan.status === "disbursed" || loan.status === "repaying" ? "completed" : "pending",
    }));

  const recentActivity = transactions.map((tx) => ({
    id: tx.id,
    title: tx.type?.replace(/_/g, " ") || "Transaction",
    description:
      tx.description ||
      `${tx.employees?.first_name || ""} ${tx.employees?.last_name || ""}`.trim() ||
      "System activity",
    time: tx.created_at ? formatRelativeTime(tx.created_at) : "—",
  }));

  const upcomingRepayments = repayments.map((repayment) => {
    const amountValue = Number(repayment.amount_due) || 0;
    return {
      id: repayment.id,
      borrower: `${repayment.employees?.first_name || ""} ${repayment.employees?.last_name || ""}`.trim() || "—",
      amount: formatCurrency(amountValue),
      amountValue,
      dueDate: repayment.due_date ? formatDate(repayment.due_date) : "—",
      status: repayment.status || "pending",
    };
  });

  const employeeSummaries = activeEmployees.slice(0, 5).map((employee) => {
    const empLoans = loansByEmployee[employee.id] || { total: 0, outstanding: 0, count: 0 };
    return {
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      savings: formatCurrency(savingsByEmployee[employee.id] || 0),
      loans: formatCurrency(empLoans.total),
      balance: formatCurrency(empLoans.outstanding),
      dividends: formatCurrency(dividendsByEmployee[employee.id] || 0),
      withdrawals: formatCurrency(withdrawalsByEmployee[employee.id] || 0),
    };
  });

  const unionRepLoans = unionRepQueue.slice(0, 6).map((item) => {
    const loan = loanMap.get(item.loanId);
    const savingsTotal = loan ? savingsByEmployee[loan.employee_id] || 0 : 0;
    const outstanding = loan ? loansByEmployee[loan.employee_id]?.outstanding || 0 : 0;
    const score = Math.min(
      100,
      Math.round((savingsTotal / Math.max(item.amountValue || 1, 1)) * 40 + 60)
    );

    return {
      approvalId: item.approvalId,
      id: item.loanId,
      name: item.applicant,
      employeeId: loan?.employee_id ?? "",
      currentSavings: formatCurrency(savingsTotal),
      currentLoans: formatCurrency(outstanding),
      monthlyRepayments: loan ? formatCurrency(Number(loan.monthly_repayment) || 0) : item.amount,
      loanHistory: loan ? `${loansByEmployee[loan.employee_id]?.count || 0} prior loans` : "—",
      eligibilityScore: score,
      status:
        score >= 80
          ? ("eligible" as const)
          : score >= 60
            ? ("review" as const)
            : score >= 40
              ? ("caution" as const)
              : ("ineligible" as const),
    };
  });

  const unionRepStats = {
    pendingReviews: unionRepQueue.length,
    approvedReviews: approvalActions.filter((action) => action.action === "approved").length,
    rejectedReviews: approvalActions.filter((action) => action.action === "rejected").length,
  };

  const recentRecommendations = approvalActions.slice(0, 4).map((action) => {
    const approval = action.approvals;
    const loan =
      approval?.entity_type === "loan" ? loanMap.get(approval.entity_id) : null;
    const withdrawal =
      approval?.entity_type === "withdrawal" ? withdrawalMap.get(approval.entity_id) : null;

    return {
      employee: loan
        ? employeeName(loan)
        : withdrawal
          ? withdrawalEmployeeName(withdrawal)
          : "—",
      action: action.action || "review",
      amount: loan
        ? formatCurrency(Number(loan.amount_requested) || 0)
        : withdrawal
          ? formatCurrency(Number(withdrawal.amount) || 0)
          : formatCurrency(0),
      date: action.actioned_at ? formatDate(action.actioned_at) : "—",
      status: action.action || "pending",
    };
  });

  const recentOperations = transactions.slice(0, 4).map((tx) => ({
    action: tx.type?.replace(/_/g, " ") || "Operation",
    description: tx.description || "Transaction recorded",
    time: tx.created_at ? formatRelativeTime(tx.created_at) : "—",
    status: "success",
  }));

  return {
    totalEmployees: activeEmployees.length,
    totalSavings,
    totalLoansOutstanding,
    totalLoansDisbursed,
    fundBalance: Math.max(totalSavings - totalLoansOutstanding, 0),
    pendingApprovals: approvals.length,
    pendingLoans,
    approvedLoans,
    totalWithdrawals,
    totalDividends,
    activeUsers: profilesRes.data?.length || 0,
    savingsTrend,
    loanDistribution,
    loanTrend,
    recentActivity,
    approvalQueue,
    upcomingRepayments,
    pendingLoanReviews,
    chairpersonQueue,
    recentDisbursements,
    employeeSummaries,
    unionRepStats,
    unionRepLoans,
    recentRecommendations,
    recentOperations,
    auditLogCount: auditCountRes.count ?? 0,
    transactionsToday: transactionsTodayRes.count ?? 0,
  };
}

export async function fetchEmployeeDashboardData(userId: string, profile: {
  full_name: string;
  employee_id: string | null;
}) {
  const supabase = await createClient();
  const employeeUuid = profile.employee_id
    ? await resolveEmployeeUuid(supabase, profile.employee_id)
    : null;

  if (!employeeUuid) {
    return {
      fullName: profile.full_name,
      totalSavings: 0,
      totalLoanBalance: 0,
      pendingRequests: 0,
      activeLoans: [],
      recentActivity: [],
      pendingApplications: [],
      savingsChange: undefined,
      loanChange: undefined,
    };
  }

  const [savingsRes, loansRes, approvalsRes, transactionsRes, allLoansRes, contributionsRes] =
    await Promise.all([
      supabase.from("savings").select("balance, account_number, type").eq("employee_id", employeeUuid),
      supabase.from("loans").select("*").eq("employee_id", employeeUuid).in("status", ["disbursed", "repaying"]),
      supabase.from("approvals").select("*").eq("submitted_by", userId).eq("status", "pending"),
      supabase
        .from("transactions")
        .select("*")
        .eq("employee_id", employeeUuid)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("loans").select("outstanding_balance").eq("employee_id", employeeUuid),
      supabase
        .from("savings_contributions")
        .select("amount, period_year, period_month")
        .eq("employee_id", employeeUuid),
    ]);

  const savingsData = savingsRes.data || [];
  const loansData = loansRes.data || [];
  const approvalsData = (approvalsRes.data || []) as any[];
  const transactionsData = transactionsRes.data || [];

  const loanIds = approvalsData.map((a) => a.entity_id).filter(Boolean);
  const pendingLoanDetailsRes =
    loanIds.length > 0
      ? await supabase.from("loans").select("id, loan_ref, amount_requested, purpose, created_at").in("id", loanIds)
      : { data: [] };
  const pendingLoanMap = new Map(
    ((pendingLoanDetailsRes.data || []) as any[]).map((loan) => [loan.id, loan])
  );
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const contributions = (contributionsRes.data || []) as any[];

  const currentMonthTotal = contributions
    .filter((c) => c.period_year === now.getFullYear() && c.period_month === now.getMonth() + 1)
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const lastMonthTotal = contributions
    .filter(
      (c) =>
        c.period_year === lastMonth.getFullYear() && c.period_month === lastMonth.getMonth() + 1
    )
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const totalLoanBalance = sum(allLoansRes.data || [], "outstanding_balance");

  return {
    fullName: profile.full_name,
    totalSavings: sum(savingsData, "balance"),
    totalLoanBalance,
    pendingRequests: approvalsData.length,
    activeLoans: loansData,
    recentActivity: transactionsData,
    pendingApplications: approvalsData.map((approval) => {
      const loan = pendingLoanMap.get(approval.entity_id);
      return {
        id: approval.id,
        current_stage: approval.current_stage ?? 1,
        total_stages: approval.total_stages ?? 3,
        status: approval.status,
        submitted_at: approval.submitted_at,
        loan_ref: loan?.loan_ref ?? approval.entity_id?.slice(0, 8) ?? "—",
        amount_requested: loan?.amount_requested ?? 0,
        purpose: loan?.purpose ?? "Loan Application",
        created_at: loan?.created_at ?? approval.submitted_at,
      };
    }),
    savingsChange:
      currentMonthTotal > 0 || lastMonthTotal > 0
        ? `${currentMonthTotal >= lastMonthTotal ? "+" : ""}${formatCurrency(currentMonthTotal - lastMonthTotal)}`
        : undefined,
    loanChange: totalLoanBalance > 0 ? formatCurrency(totalLoanBalance) : undefined,
  };
}
