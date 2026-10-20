import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseCsv } from "@/lib/csv";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // Verify the requester is a super admin
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

    if (profile?.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only super admins can import employees." },
        { status: 403 }
      );
    }

    // Parse CSV file — header-driven so quoted values and column order from
    // exports/templates both work.
    const rows = parseCsv(await file.text());
    const employees = rows.map((r) => ({
      employee_no: r["employee no"] || r["employee_no"] || r["staffid"] || r["staff id"],
      email: r["email"],
      phone_number: r["phone number"] || r["phone_number"] || r["phone"] || r["contact"],
      first_name: r["first name"] || r["first_name"],
      last_name: r["last name"] || r["last_name"],
    })).filter((e) => e.employee_no);

    // Insert into pending_employees table
    const { error: insertError } = await admin
      .from("pending_employees")
      .insert(
        employees.map(emp => ({
          employee_no: emp.employee_no,
          email: emp.email,
          phone_number: emp.phone_number,
          first_name: emp.first_name || null,
          last_name: emp.last_name || null,
          status: 'pending',
          imported_by: user.id,
        }))
      );

    if (insertError) {
      console.error("[/api/admin/import-employees] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to import employees. Some may already exist." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${employees.length} employees for review.`,
      count: employees.length,
    });
  } catch (err: any) {
    console.error("[/api/admin/import-employees] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
