import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageUsers, getStaffUser } from "@/lib/api/staff-auth";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  if (!canManageUsers(role)) {
    return NextResponse.json({ error: "Only Admins can delete employees." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const employeeId = body.employeeId as string | undefined;

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get employee details
    const { data: employee, error: employeeError } = await (adminClient
      .from("employees") as any)
      .select("id, employee_no, email, first_name, last_name")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Get the auth user ID from profiles — employee_id may hold the employee
    // UUID (current convention) or a legacy employee_no.
    let { data: profile } = await (adminClient
      .from("profiles") as any)
      .select("user_id")
      .eq("employee_id", employee.id)
      .maybeSingle();

    if (!profile) {
      const fallback = await (adminClient
        .from("profiles") as any)
        .select("user_id")
        .eq("employee_id", employee.employee_no)
        .maybeSingle();
      profile = fallback.data;
    }

    if (!profile) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // Delete related records in correct order (respecting foreign key constraints)
    // 1. Delete savings accounts
    await (adminClient.from("savings") as any).delete().eq("employee_id", employeeId);

    // 2. Delete loan guarantor relationships
    await (adminClient.from("loan_guarantors") as any).delete().eq("guarantor_id", employeeId);

    // 3. Get loan IDs and withdrawal IDs before deleting them, so their
    // approval pipeline records don't end up orphaned.
    const { data: loans } = await (adminClient.from("loans") as any)
      .select("id")
      .eq("employee_id", employeeId);
    const loanIds = (loans ?? []).map((l: any) => l.id);

    const { data: withdrawalRows } = await (adminClient.from("withdrawal_requests") as any)
      .select("id")
      .eq("employee_id", employeeId);
    const withdrawalIds = (withdrawalRows ?? []).map((w: any) => w.id);

    // 4. Delete loan amortization schedules, guarantor rows, and approvals
    if (loanIds.length > 0) {
      await (adminClient.from("loan_amortization_schedules") as any)
        .delete()
        .in("loan_id", loanIds);
      await (adminClient.from("loan_guarantors") as any)
        .delete()
        .in("loan_id", loanIds);
    }

    const orphanFilters = [
      loanIds.length ? `and(entity_type.eq.loan,entity_id.in.(${loanIds.join(",")}))` : null,
      withdrawalIds.length ? `and(entity_type.eq.withdrawal,entity_id.in.(${withdrawalIds.join(",")}))` : null,
    ].filter(Boolean) as string[];

    if (orphanFilters.length > 0) {
      const { data: orphanApprovals } = await (adminClient.from("approvals") as any)
        .select("id")
        .or(orphanFilters.join(","));

      const approvalIds = (orphanApprovals ?? []).map((a: any) => a.id);
      if (approvalIds.length > 0) {
        await (adminClient.from("approval_actions") as any).delete().in("approval_id", approvalIds);
        await (adminClient.from("approvals") as any).delete().in("id", approvalIds);
      }
    }

    // 5. Delete loan applications
    await (adminClient.from("loans") as any).delete().eq("employee_id", employeeId);

    // 6. Delete repayments
    await (adminClient.from("repayments") as any).delete().eq("employee_id", employeeId);

    // 7. Delete withdrawal requests
    await (adminClient.from("withdrawal_requests") as any).delete().eq("employee_id", employeeId);

    // 8. Delete savings contributions
    await (adminClient.from("savings_contributions") as any).delete().eq("employee_id", employeeId);

    // 9. Delete savings adjustments
    await (adminClient.from("savings_adjustments") as any).delete().eq("employee_id", employeeId);

    // 10. Delete beneficiaries
    await (adminClient.from("beneficiaries") as any).delete().eq("employee_id", employeeId);

    // 11. Delete statement requests
    await (adminClient.from("statement_requests") as any).delete().eq("employee_id", employeeId);

    // 12. Delete payroll logs
    await (adminClient.from("payroll_logs") as any).delete().eq("employee_id", employeeId);

    // 13. Delete ledger entries
    await (adminClient.from("ledger_entries") as any).delete().eq("employee_id", employeeId);

    // 14. Delete profile
    await (adminClient.from("profiles") as any).delete().eq("user_id", profile.user_id);

    // 15. Delete auth user
    await adminClient.auth.admin.deleteUser(profile.user_id);

    // 16. Delete employee record
    const { error: deleteError } = await (adminClient.from("employees") as any)
      .delete()
      .eq("id", employeeId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log the action
    await (adminClient.from("audit_logs") as any).insert({
      action: "EMPLOYEE_DELETED",
      entity_type: "employee",
      entity_id: employeeId,
      performed_by: user.id,
      details: {
        employee_no: employee.employee_no,
        email: employee.email,
        full_name: `${employee.first_name} ${employee.last_name}`,
      },
    });

    return NextResponse.json({
      message: "Employee and all related records deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete employee." },
      { status: 500 }
    );
  }
}
