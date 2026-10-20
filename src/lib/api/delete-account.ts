import type { SupabaseClient } from "@supabase/supabase-js";

// Full account teardown: removes every record tied to an employee/user,
// respecting RESTRICT foreign keys, then the profile, auth user, and
// employee row itself. Shared by /api/employees/delete and
// /api/admin/user-action so both paths behave identically.
export async function deleteEmployeeAccount(
  admin: SupabaseClient,
  employeeId: string,
  performedBy: string | null
) {
  const { data: employee, error: employeeError } = await (admin
    .from("employees") as any)
    .select("id, employee_no, email, first_name, last_name")
    .eq("id", employeeId)
    .single();

  if (employeeError || !employee) {
    return { error: "Employee not found.", status: 404 } as const;
  }

  // Get the auth user ID from profiles — employee_id may hold the employee
  // UUID (current convention) or a legacy employee_no.
  let { data: profile } = await (admin.from("profiles") as any)
    .select("user_id")
    .eq("employee_id", employee.id)
    .maybeSingle();

  if (!profile) {
    const fallback = await (admin.from("profiles") as any)
      .select("user_id")
      .eq("employee_id", employee.employee_no)
      .maybeSingle();
    profile = fallback.data;
  }

  // Fall back to matching profile/auth user by email when no profile is
  // linked by employee_id (unlinked legacy accounts).
  if (!profile && employee.email) {
    const fallback = await (admin.from("profiles") as any)
      .select("user_id")
      .eq("email", employee.email)
      .maybeSingle();
    profile = fallback.data;
  }

  // Delete related records in correct order (respecting foreign key constraints)
  await (admin.from("savings") as any).delete().eq("employee_id", employeeId);
  await (admin.from("loan_guarantors") as any).delete().eq("guarantor_id", employeeId);

  const { data: loans } = await (admin.from("loans") as any)
    .select("id")
    .eq("employee_id", employeeId);
  const loanIds = (loans ?? []).map((l: any) => l.id);

  const { data: withdrawalRows } = await (admin
    .from("withdrawal_requests") as any)
    .select("id")
    .eq("employee_id", employeeId);
  const withdrawalIds = (withdrawalRows ?? []).map((w: any) => w.id);

  if (loanIds.length > 0) {
    await (admin.from("loan_amortization_schedules") as any)
      .delete()
      .in("loan_id", loanIds);
    await (admin.from("loan_guarantors") as any).delete().in("loan_id", loanIds);
  }

  const orphanFilters = [
    loanIds.length ? `and(entity_type.eq.loan,entity_id.in.(${loanIds.join(",")}))` : null,
    withdrawalIds.length ? `and(entity_type.eq.withdrawal,entity_id.in.(${withdrawalIds.join(",")}))` : null,
  ].filter(Boolean) as string[];

  if (orphanFilters.length > 0) {
    const { data: orphanApprovals } = await (admin.from("approvals") as any)
      .select("id")
      .or(orphanFilters.join(","));

    const approvalIds = (orphanApprovals ?? []).map((a: any) => a.id);
    if (approvalIds.length > 0) {
      await (admin.from("approval_actions") as any).delete().in("approval_id", approvalIds);
      await (admin.from("approvals") as any).delete().in("id", approvalIds);
    }
  }

  await (admin.from("loans") as any).delete().eq("employee_id", employeeId);
  await (admin.from("repayments") as any).delete().eq("employee_id", employeeId);
  await (admin.from("withdrawal_requests") as any).delete().eq("employee_id", employeeId);
  await (admin.from("savings_contributions") as any).delete().eq("employee_id", employeeId);
  await (admin.from("savings_adjustments") as any).delete().eq("employee_id", employeeId);
  await (admin.from("beneficiaries") as any).delete().eq("employee_id", employeeId);
  await (admin.from("statement_requests") as any).delete().eq("employee_id", employeeId);
  await (admin.from("payroll_logs") as any).delete().eq("employee_id", employeeId);
  await (admin.from("ledger_entries") as any).delete().eq("employee_id", employeeId);
  await (admin.from("notifications") as any).delete().eq("employee_id", employeeId);
  await (admin.from("impersonation_sessions") as any).delete().eq("target_employee_id", employeeId);

  if (profile?.user_id) {
    await (admin.from("impersonation_sessions") as any).delete().eq("target_user_id", profile.user_id);
    await (admin.from("profiles") as any).delete().eq("user_id", profile.user_id);
    // Deleting the auth user cascades to otp_codes, sessions,
    // push_subscriptions, and profiles (FK ON DELETE CASCADE).
    await admin.auth.admin.deleteUser(profile.user_id);
  }

  const { error: deleteError } = await (admin.from("employees") as any)
    .delete()
    .eq("id", employeeId);

  if (deleteError) {
    return { error: deleteError.message, status: 500 } as const;
  }

  await (admin.from("audit_logs") as any).insert({
    action: "EMPLOYEE_DELETED",
    entity_type: "employee",
    entity_id: employeeId,
    performed_by: performedBy,
    details: {
      employee_no: employee.employee_no,
      email: employee.email,
      full_name: `${employee.first_name} ${employee.last_name}`,
    },
  });

  return { error: null, status: 200 } as const;
}
