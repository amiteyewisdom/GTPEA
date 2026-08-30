import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
        { error: "Only admins can export loan data." },
        { status: 403 }
      );
    }

    // Fetch all loans with employee information
    const { data: loans, error: loansError } = await admin
      .from("loans")
      .select(`
        *,
        employees (
          employee_no,
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (loansError) {
      console.error("[/api/admin/export-loans] Fetch error:", loansError);
      return NextResponse.json(
        { error: "Failed to fetch loan data." },
        { status: 500 }
      );
    }

    // Convert to CSV
    const headers = ["Employee No", "First Name", "Last Name", "Email", "Loan Ref", "Amount Requested", "Amount Approved", "Interest Rate", "Term Months", "Purpose", "Status", "Created At"];
    const csvRows = loans?.map((l: any) => [
      l.employees?.employee_no || '',
      l.employees?.first_name || '',
      l.employees?.last_name || '',
      l.employees?.email || '',
      l.loan_ref || '',
      l.amount_requested || 0,
      l.amount_approved || 0,
      l.interest_rate || 0,
      l.term_months || 0,
      l.purpose || '',
      l.status || '',
      l.created_at || ''
    ]) || [];

    const csvContent = [
      headers.join(','),
      ...csvRows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="loans_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("[/api/admin/export-loans] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
