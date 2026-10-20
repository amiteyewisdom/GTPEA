import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageUsers, getStaffUser } from "@/lib/api/staff-auth";
import { deleteEmployeeAccount } from "@/lib/api/delete-account";

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

    const result = await deleteEmployeeAccount(createAdminClient(), employeeId, user.id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

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
