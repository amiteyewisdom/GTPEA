import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLoggedInEmployee } from "@/lib/loans/employee";

export async function GET() {
  try {
    const supabase = await createClient();
    const employee = await getLoggedInEmployee(supabase);

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const admin = createAdminClient();

    const { data: savings, error } = await admin
      .from("savings")
      .select("id, account_number, type, balance, status")
      .eq("employee_id", employee.employeeId)
      .eq("status", "active");

    if (error) {
      console.error("[/api/savings/accounts] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ accounts: savings || [] });
  } catch (err: any) {
    console.error("[/api/savings/accounts] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
