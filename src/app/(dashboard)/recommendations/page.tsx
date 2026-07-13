import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Star, CheckCircle, XCircle, ClipboardList } from "lucide-react";

export const metadata: Metadata = { title: "Recommendations" };
export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6 text-brand-text-secondary">
        Please sign in to view recommendations.
      </div>
    );
  }

  const { data: actions } = await supabase
    .from("approval_actions")
    .select("id, action, stage, required_role, actioned_at, notes, approval_id")
    .eq("actioned_by", user.id)
    .eq("stage", 1)
    .order("actioned_at", { ascending: false });

  const approvalIds = ((actions ?? []) as any[]).map((a) => a.approval_id).filter(Boolean);

  const { data: approvals } =
    approvalIds.length > 0
      ? await supabase
          .from("approvals")
          .select("id, entity_type, entity_id")
          .in("id", approvalIds)
      : { data: [] };

  const loanApprovalIds = ((approvals ?? []) as any[])
    .filter((a) => a.entity_type === "loan")
    .map((a) => a.entity_id)
    .filter(Boolean);

  const { data: loans } =
    loanApprovalIds.length > 0
      ? await supabase
          .from("loans")
          .select("id, amount_requested, employee_id, employees!employee_id (first_name, last_name, employee_no)")
          .in("id", loanApprovalIds)
      : { data: [] };

  const loanMap = new Map(((loans ?? []) as any[]).map((l) => [l.id, l]));
  const approvalMap = new Map(((approvals ?? []) as any[]).map((a) => [a.id, a]));

  // Exclude recommendations for loans linked to admin/rep/manager employee accounts
  const employeeIds = [...new Set(((loans ?? []) as any[]).map((l) => l.employee_id).filter(Boolean))];
  const { data: employeeProfiles } =
    employeeIds.length > 0
      ? await supabase
          .from("profiles")
          .select("employee_id, role")
          .in("employee_id", employeeIds)
          .not("employee_id", "is", null)
      : { data: [] };
  const nonEmployeeIds = new Set(
    ((employeeProfiles ?? []) as any[])
      .filter((p) => p.role !== "employee")
      .map((p) => p.employee_id)
  );
  const employeeOnlyLoanMap = new Map(
    ((loans ?? []) as any[])
      .filter((l) => !nonEmployeeIds.has(l.employee_id))
      .map((l) => [l.id, l])
  );

  const recommendations = ((actions ?? []) as any[]).flatMap((action: any) => {
    const approval = approvalMap.get(action.approval_id);
    const loan = approval?.entity_type === "loan" ? employeeOnlyLoanMap.get(approval.entity_id) : null;
    if (!loan) return [];

    const employee = loan.employees;
    const name = employee
      ? `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim() || "Unknown"
      : "Unknown";
    const amount = Number(loan.amount_requested) || 0;

    return [
      {
        id: action.id,
        employee: name,
        employeeId: employee?.employee_no ?? "—",
        action: action.action ?? "pending",
        amount,
        date: action.actioned_at,
        notes: action.notes,
      },
    ];
  });

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    approved: { label: "Approved", color: "text-brand-success", icon: CheckCircle },
    rejected: { label: "Rejected", color: "text-brand-danger", icon: XCircle },
    on_hold: { label: "On Hold", color: "text-brand-warning", icon: Star },
    pending: { label: "Pending", color: "text-brand-warning", icon: ClipboardList },
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">My Recommendations</h1>
        <p className="text-sm md:text-base text-brand-text-secondary">
          History of loan recommendations you have submitted at stage 1.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-brand-card-bg border border-brand-card-border rounded-xl p-8 text-center">
          <Star className="w-10 h-10 text-brand-text-secondary mx-auto mb-3" />
          <p className="text-brand-text font-medium">No recommendations yet</p>
          <p className="text-brand-text-secondary text-sm mt-1">
            Recommendations you make on loan applications will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-brand-card-bg border border-brand-card-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-card-border">
                  <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Employee</th>
                  <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Recommendation</th>
                  <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-brand-text-secondary text-sm font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => {
                  const config = statusConfig[rec.action] ?? statusConfig.pending;
                  const Icon = config.icon;
                  return (
                    <tr key={rec.id} className="border-b border-brand-card-border last:border-0 hover:bg-brand-hover">
                      <td className="py-3 px-4 text-sm text-brand-text">
                        <p className="font-medium">{rec.employee}</p>
                        <p className="text-brand-text-secondary text-xs">{rec.employeeId}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-brand-text font-medium">
                        {formatCurrency(rec.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-brand-text-secondary">
                        {rec.date ? formatDate(rec.date) : "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-brand-text-secondary">
                        {rec.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
