import { createClient } from "@/lib/supabase/server";

function sum(rows: { [key: string]: unknown }[], field: string) {
  return rows.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
}

export async function fetchApprovalsList() {
  const supabase = await createClient();

  const { data: approvals, count, error: approvalsError } = await supabase
    .from("approvals")
    .select(
      `*,
       approval_actions (stage, required_role, action, notes, actioned_at)`,
      { count: "exact" }
    )
    .order("submitted_at", { ascending: false });

  if (approvalsError) {
    console.error("[fetchApprovalsList] approvals query error:", approvalsError.message);
  }

  const rows = (approvals ?? []) as any[];

  // Fetch submitter names separately (avoids FK name mismatch issues)
  const submitterIds = [...new Set(rows.map((r) => r.submitted_by).filter(Boolean))] as string[];
  const profilesMap = new Map<string, string>();
  if (submitterIds.length) {
    const profilesRes = await supabase
      .from("profiles")
      .select("user_id, full_name, role")
      .in("user_id", submitterIds)
      .neq("role", "super_admin");
    for (const p of profilesRes.data ?? []) {
      profilesMap.set((p as any).user_id, (p as any).full_name);
    }
  }

  const loanIds = rows.filter((row) => row.entity_type === "loan").map((row) => row.entity_id);
  const withdrawalIds = rows
    .filter((row) => row.entity_type === "withdrawal")
    .map((row) => row.entity_id);

  const [loansRes, withdrawalsRes] = await Promise.all([
    loanIds.length
      ? supabase
          .from("loans")
          .select(
            "id, employee_id, amount_requested, amount_approved, outstanding_balance, monthly_repayment, term_months, interest_rate, interest_calc_method, loan_products (name)"
          )
          .in("id", loanIds)
      : Promise.resolve({ data: [] as any[] }),
    withdrawalIds.length
      ? supabase
          .from("withdrawal_requests")
          .select("id, employee_id, amount, savings (balance, type)")
          .in("id", withdrawalIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const loanMap = new Map<string, any>((loansRes.data ?? []).map((loan: any) => [loan.id, loan]));
  const withdrawalMap = new Map<string, any>(
    (withdrawalsRes.data ?? []).map((withdrawal: any) => [withdrawal.id, withdrawal])
  );

  const employeeIds = [
    ...new Set(
      rows.flatMap((row) => {
        if (row.entity_type === "loan") return loanMap.get(row.entity_id)?.employee_id;
        if (row.entity_type === "withdrawal") return withdrawalMap.get(row.entity_id)?.employee_id;
        return null;
      }).filter(Boolean)
    ),
  ] as string[];

  const employeeSummaries = new Map<string, { total_savings: number; total_loan_balance: number; monthly_savings: number }>();

  if (employeeIds.length) {
    const [savingsRes, loansBalanceRes, contributionsRes] = await Promise.all([
      supabase.from("savings").select("employee_id, balance").in("employee_id", employeeIds),
      supabase.from("loans").select("employee_id, outstanding_balance").in("employee_id", employeeIds),
      supabase.from("savings_contributions").select("employee_id, amount, period_year, period_month").in("employee_id", employeeIds),
    ]);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    for (const employeeId of employeeIds) {
      const savingsRows = (savingsRes.data ?? []).filter((row: any) => row.employee_id === employeeId);
      const loanRows = (loansBalanceRes.data ?? []).filter((row: any) => row.employee_id === employeeId);
      const contributionRows = (contributionsRes.data ?? []).filter(
        (row: any) =>
          row.employee_id === employeeId && row.period_year === year && row.period_month === month
      );

      employeeSummaries.set(employeeId, {
        total_savings: sum(savingsRows, "balance"),
        total_loan_balance: sum(loanRows, "outstanding_balance"),
        monthly_savings: sum(contributionRows, "amount"),
      });
    }
  }

  const enriched = rows.map((row) => {
    const loan = row.entity_type === "loan" ? loanMap.get(row.entity_id) : null;
    const withdrawal = row.entity_type === "withdrawal" ? withdrawalMap.get(row.entity_id) : null;
    const employeeId = loan?.employee_id ?? withdrawal?.employee_id;

    return {
      ...row,
      profiles: { full_name: profilesMap.get(row.submitted_by) ?? null },
      loan_details: loan
        ? {
            amount_requested: loan.amount_requested,
            amount_approved: loan.amount_approved,
            outstanding_balance: loan.outstanding_balance,
            monthly_repayment: loan.monthly_repayment,
            term_months: loan.term_months,
            interest_rate: loan.interest_rate,
            interest_calc_method: loan.interest_calc_method ?? null,
            product_name: loan.loan_products?.name ?? null,
          }
        : null,
      withdrawal_details: withdrawal
        ? {
            amount: withdrawal.amount,
            savings_balance: withdrawal.savings?.balance ?? 0,
            savings_type: withdrawal.savings?.type ?? "N/A",
          }
        : null,
      employee_details: employeeId ? employeeSummaries.get(employeeId) ?? null : null,
    };
  });

  return { approvals: enriched, total: count ?? 0 };
}
