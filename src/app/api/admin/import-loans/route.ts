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
        { error: "Only admins can import loan data." },
        { status: 403 }
      );
    }

    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').slice(1); // Skip header
    const loanRecords = lines
      .filter(line => line.trim())
      .map(line => {
        const [employee_no, loan_ref, amount_requested, amount_approved, interest_rate, term_months, purpose, status] = line.split(',').map(s => s.trim());
        return { employee_no, loan_ref, amount_requested, amount_approved, interest_rate, term_months, purpose, status };
      });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const record of loanRecords) {
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

        // Get default loan product
        const { data: loanProduct } = await admin
          .from("loan_products")
          .select("id")
          .eq("is_active", true)
          .limit(1)
          .single();

        if (!loanProduct) {
          errors.push(`No active loan product found for ${record.employee_no}`);
          errorCount++;
          continue;
        }

        // Check if loan already exists by loan_ref
        const { data: existingLoan } = await admin
          .from("loans")
          .select("id")
          .eq("loan_ref", record.loan_ref)
          .single();

        if (existingLoan) {
          // Update existing loan
          const { error: updateError } = await admin
            .from("loans")
            .update({
              amount_requested: parseFloat(record.amount_requested) || 0,
              amount_approved: parseFloat(record.amount_approved) || 0,
              interest_rate: parseFloat(record.interest_rate) || 0,
              term_months: parseInt(record.term_months) || 12,
              purpose: record.purpose,
              status: record.status || 'pending',
              updated_at: new Date().toISOString()
            })
            .eq("id", existingLoan.id);

          if (updateError) {
            errors.push(`Failed to update loan ${record.loan_ref}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          // Create new loan
          const { error: insertError } = await admin
            .from("loans")
            .insert({
              loan_ref: record.loan_ref,
              employee_id: employee.id,
              loan_product_id: loanProduct.id,
              amount_requested: parseFloat(record.amount_requested) || 0,
              amount_approved: parseFloat(record.amount_approved) || 0,
              interest_rate: parseFloat(record.interest_rate) || 0,
              term_months: parseInt(record.term_months) || 12,
              purpose: record.purpose,
              status: record.status || 'pending',
            });

          if (insertError) {
            errors.push(`Failed to create loan ${record.loan_ref}`);
            errorCount++;
          } else {
            successCount++;
          }
        }
      } catch (error) {
        errors.push(`Error processing loan ${record.loan_ref}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${successCount} loan records successfully`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10),
    });
  } catch (err: any) {
    console.error("[/api/admin/import-loans] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
