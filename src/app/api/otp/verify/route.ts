import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "User ID and OTP code are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get the latest OTP for this user
    const { data: otpData, error: otpError } = await admin
      .from("otp_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("is_used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: "No valid OTP found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const expiresAt = new Date(otpData.expires_at);
    const now = new Date();
    if (now > expiresAt) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify the code
    if (otpData.code !== code) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    // Mark OTP as used
    const { error: updateError } = await admin
      .from("otp_codes")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", otpData.id);

    if (updateError) {
      console.error("[/api/otp/verify] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to verify OTP." },
        { status: 500 }
      );
    }

    // Ensure user has a profile record (for employees)
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Resolve the employee record for this login. The staff ID in the auth
    // email (e.g. 6328@staff.gtpea.local) is the primary identifier — it is
    // literally what they logged in with. Phone matching is the fallback and
    // must handle stored-format differences (0549… vs 233549…).
    const resolveEmployee = async (): Promise<any | null> => {
      try {
        const { data: { user } } = await admin.auth.admin.getUserById(userId);
        const staffId = user?.email?.includes('@staff.gtpea.local')
          ? user.email.split('@')[0]
          : null;
        if (staffId) {
          const byStaffId = await admin
            .from("employees")
            .select("id, full_name, first_name, last_name, department")
            .eq("employee_no", staffId)
            .maybeSingle();
          if (byStaffId.data) {
            console.log('[/api/otp/verify] Employee found by staff_id:', staffId);
            return byStaffId.data;
          }
        }
      } catch (error) {
        console.log('[/api/otp/verify] staff_id lookup failed:', error);
      }

      // Phone fallback — try every plausible format of the number
      const raw = String(otpData.phone_number ?? '').replace(/\D/g, '');
      const variants = [raw];
      if (raw.startsWith('233') && raw.length === 12) variants.push('0' + raw.slice(3));
      if (raw.startsWith('0')) variants.push('233' + raw.slice(1));
      if (raw.length === 9) variants.push('0' + raw, '233' + raw);

      for (const variant of variants) {
        for (const field of ['phone_number', 'phone']) {
          const result = await admin
            .from("employees")
            .select("id, full_name, first_name, last_name, department")
            .eq(field, variant)
            .maybeSingle();
          if (result.data) {
            console.log('[/api/otp/verify] Employee found by phone:', field, variant);
            return result.data;
          }
        }
      }
      return null;
    };

    const employee = await resolveEmployee();

    if (!existingProfile) {
      const fullName = employee
        ? (employee.full_name ||
           (employee.first_name && employee.last_name
            ? `${employee.first_name} ${employee.last_name}`
            : "User"))
        : "User";

      await admin
        .from("profiles")
        .insert({
          user_id: userId,
          employee_id: employee?.id ?? null,
          full_name: fullName,
          role: "employee",
          phone: otpData.phone_number,
          avatar_url: null,
        });
      console.log('[/api/otp/verify] Created profile:', fullName, 'employee_id:', employee?.id ?? 'none');
    } else if (existingProfile.full_name === "User" || !existingProfile.employee_id) {
      // Update existing bare profile if we can now resolve the employee
      if (employee) {
        const fullName = employee.full_name ||
                         (employee.first_name && employee.last_name
                          ? `${employee.first_name} ${employee.last_name}`
                          : existingProfile.full_name);

        await admin
          .from("profiles")
          .update({
            employee_id: employee.id,
            full_name: fullName,
          })
          .eq("user_id", userId);
        console.log('[/api/otp/verify] Updated profile with employee_id:', employee.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err: any) {
    console.error("[/api/otp/verify] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
