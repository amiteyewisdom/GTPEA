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
        { error: "Only admins can import savings data." },
        { status: 403 }
      );
    }

    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').slice(1); // Skip header
    const savingsRecords = lines
      .filter(line => line.trim())
      .map(line => {
        const [employee_no, type, balance, monthly_contribution, interest_rate, account_number] = line.split(',').map(s => s.trim());
        return { employee_no, type, balance, monthly_contribution, interest_rate, account_number };
      });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const record of savingsRecords) {
      try {
        // Find employee by employee_no
        const { data: employee, error: employeeError } = await admin
          .from("employees")
          .select("id")
          .eq("employee_no", record.employee_no)
          .single();

        if (employeeError || !employee) {
          errors.push(`Employee ${record.employee_no} not found`);
          errorCount++;
          continue;
        }

        // Check if savings account already exists for this employee
        const { data: existingSavings } = await admin
          .from("savings")
          .select("id")
          .eq("employee_id", employee.id)
          .single();

        if (existingSavings) {
          // Update existing savings
          const { error: updateError } = await admin
            .from("savings")
            .update({
              balance: parseFloat(record.balance) || 0,
              monthly_contribution: parseFloat(record.monthly_contribution) || 0,
              interest_rate: parseFloat(record.interest_rate) || 0,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingSavings.id);

          if (updateError) {
            errors.push(`Failed to update savings for ${record.employee_no}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          // Create new savings account
          const { error: insertError } = await admin
            .from("savings")
            .insert({
              employee_id: employee.id,
              type: record.type || 'regular',
              status: 'active',
              balance: parseFloat(record.balance) || 0,
              monthly_contribution: parseFloat(record.monthly_contribution) || 0,
              interest_rate: parseFloat(record.interest_rate) || 0,
              account_number: record.account_number || `SAV-${record.employee_no}`,
            });

          if (insertError) {
            errors.push(`Failed to create savings for ${record.employee_no}`);
            errorCount++;
          } else {
            successCount++;
          }
        }
      } catch (error) {
        errors.push(`Error processing ${record.employee_no}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${successCount} savings records successfully`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (err: any) {
    console.error("[/api/admin/import-savings] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
