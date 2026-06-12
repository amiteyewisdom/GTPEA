import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const employeeId = String(body?.employee_id || "");
  const action = String(body?.action || "");
  const reason = String(body?.reason || "").trim();

  if (!employeeId) {
    return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
  }

  if (action !== "suspend" && action !== "unsuspend") {
    return NextResponse.json({ error: "Action must be suspend or unsuspend." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profileRes = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = (profileRes.data as { role: string } | null)?.role;

  if (!role || !["super_admin", "administrator", "fund_manager"].includes(role)) {
    return NextResponse.json({ error: "You do not have permission to suspend accounts." }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: employee, error: fetchError } = await (admin.from("employees") as any)
    .select("id, first_name, last_name, employee_no, status")
    .eq("id", employeeId)
    .single();

  if (fetchError || !employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  const newStatus = action === "suspend" ? "suspended" : "active";

  const { error: updateError } = await (admin.from("employees") as any)
    .update({ status: newStatus })
    .eq("id", employeeId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await (admin.from("audit_logs") as any).insert({
    action: action === "suspend" ? "ACCOUNT_SUSPENDED" : "ACCOUNT_UNSUSPENDED",
    entity_type: "employee",
    entity_id: employeeId,
    performed_by: user.id,
    details: {
      employee_no: employee.employee_no,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      previous_status: employee.status,
      new_status: newStatus,
      reason: reason || null,
    },
  });

  await (admin.from("notifications") as any).insert({
    user_id: user.id,
    type: action === "suspend" ? "account_suspended" : "account_activated",
    title: action === "suspend" ? "Account Suspended" : "Account Reactivated",
    message: `${employee.first_name} ${employee.last_name} (${employee.employee_no}) has been ${action === "suspend" ? "suspended" : "reactivated"}.${reason ? ` Reason: ${reason}` : ""}`,
    entity_type: "employee",
    entity_id: employeeId,
  });

  return NextResponse.json({
    message: `Account ${action === "suspend" ? "suspended" : "reactivated"} successfully.`,
    employee: { id: employeeId, status: newStatus },
  });
}
