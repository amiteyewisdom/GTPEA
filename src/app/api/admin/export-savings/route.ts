import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildCsv } from "@/lib/csv";
import { fetchAllPages } from "@/lib/supabase/fetch-all";

export async function GET() {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    // Verify the requester is a super admin or fund manager
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "super_admin" && profile?.role !== "fund_manager" && profile?.role !== "administrator") {
      return NextResponse.json(
        { error: "Only admins can export savings data." },
        { status: 403 }
      );
    }

    // Fetch all savings with employee information, excluding test admin users
    const { data: savings, error: savingsError } = await fetchAllPages(() => admin
      .from("savings")
      .select(`
        *,
        employees (
          employee_no,
          first_name,
          last_name,
          email
        )
      `)
      .not("employees.employee_no", "in", "(ADMIN001,ADMIN002)")
      .order("created_at", { ascending: false }) as any);

    if (savingsError) {
      console.error("[/api/admin/export-savings] Fetch error:", savingsError);
      return NextResponse.json(
        { error: "Failed to fetch savings data." },
        { status: 500 }
      );
    }

    // Embed-level .not() only blanks the joined row — filter parents in JS.
    const filteredSavings = (savings ?? []).filter(
      (s: any) => !["ADMIN001", "ADMIN002"].includes(s.employees?.employee_no)
    );

    // Convert to CSV
    const headers = ["Employee No", "First Name", "Last Name", "Email", "Type", "Balance", "Monthly Contribution", "Interest Rate", "Account Number", "Status", "Created At"];
    const csvRows = filteredSavings.map((s: any) => [
      s.employees?.employee_no || '',
      s.employees?.first_name || '',
      s.employees?.last_name || '',
      s.employees?.email || '',
      s.type || '',
      s.balance || 0,
      s.monthly_contribution || 0,
      s.interest_rate || 0,
      s.account_number || '',
      s.status || '',
      s.created_at || ''
    ]);

    const csvContent = buildCsv(headers, csvRows);

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="savings_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("[/api/admin/export-savings] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
