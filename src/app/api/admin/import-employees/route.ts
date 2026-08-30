import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').slice(1); // Skip header
    const employees = lines
      .filter(line => line.trim())
      .map(line => {
        const [employee_no, email, phone_number, first_name, last_name] = line.split(',').map(s => s.trim());
        return { employee_no, email, phone_number, first_name, last_name };
      });

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
