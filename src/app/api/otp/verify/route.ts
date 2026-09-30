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

    if (!existingProfile) {
      console.log('[/api/otp/verify] No existing profile found, checking employee by phone:', otpData.phone_number);
      // Check if this is an employee by phone number - try both phone_number and phone fields
      let employee: any = null;
      const phoneFields = ['phone_number', 'phone'];
      
      for (const phoneField of phoneFields) {
        const result = await admin
          .from("employees")
          .select("id, full_name, first_name, last_name, department")
          .eq(phoneField, otpData.phone_number)
          .maybeSingle();
        if (result.data) {
          console.log('[/api/otp/verify] Employee found with field:', phoneField);
          employee = result.data;
          break;
        }
      }

      if (employee) {
        console.log('[/api/otp/verify] Employee found:', employee);
        // Use full_name if available, otherwise construct from first_name and last_name
        const fullName = employee.full_name || 
                         (employee.first_name && employee.last_name ? 
                          `${employee.first_name} ${employee.last_name}` : 
                          "User");
        
        // Create profile for employee with employee_id link
        await admin
          .from("profiles")
          .insert({
            user_id: userId,
            employee_id: employee.id,
            full_name: fullName,
            role: "employee",
            phone: otpData.phone_number,
            avatar_url: null,
          });
        console.log('[/api/otp/verify] Created profile for employee with name:', fullName);
      } else {
        console.log('[/api/otp/verify] No employee found by phone, trying staff ID from email');
        // Try to get staff ID from user email
        let employeeFromStaffId = null;
        
        try {
          const { data: { user } } = await admin.auth.admin.getUserById(userId);
          if (user?.email && user.email.includes('@staff.gtpea.local')) {
            const staffId = user.email.split('@')[0];
            console.log('[/api/otp/verify] Extracted staff_id from email:', staffId);
            const byStaffId = await admin
              .from("employees")
              .select("id, full_name, first_name, last_name, department")
              .eq("employee_no", staffId)
              .maybeSingle();
            if (byStaffId.data) {
              console.log('[/api/otp/verify] Employee found by staff_id for profile creation');
              employeeFromStaffId = byStaffId.data as any;
            }
          }
        } catch (error) {
          console.log('[/api/otp/verify] Could not get user by ID for profile creation:', error);
        }
        
        if (employeeFromStaffId) {
          const fullName = employeeFromStaffId.full_name || 
                           (employeeFromStaffId.first_name && employeeFromStaffId.last_name ? 
                            `${employeeFromStaffId.first_name} ${employeeFromStaffId.last_name}` : 
                            "User");
          
          await admin
            .from("profiles")
            .insert({
              user_id: userId,
              employee_id: employeeFromStaffId.id,
              full_name: fullName,
              role: "employee",
              phone: otpData.phone_number,
              avatar_url: null,
            });
          console.log('[/api/otp/verify] Created profile for employee found by staff_id with name:', fullName);
        } else {
          console.log('[/api/otp/verify] No employee found, creating default profile');
          // Try to extract staff ID from user email for a better default name
          let defaultName = "User";
          try {
            const { data: { user } } = await admin.auth.getUser(userId);
            if (user?.email && user.email.includes('@staff.gtpea.local')) {
              const staffId = user.email.split('@')[0];
              defaultName = `Staff ${staffId}`;
              console.log('[/api/otp/verify] Using staff ID for default name:', defaultName);
            }
          } catch (error) {
            console.log('[/api/otp/verify] Could not get user for default name:', error);
          }
          
          // Create default profile for non-employee
          await admin
            .from("profiles")
            .insert({
              user_id: userId,
              full_name: defaultName,
              role: "employee",
              phone: otpData.phone_number,
              avatar_url: null,
            });
        }
      }
    } else if (existingProfile.full_name === "User" || !existingProfile.employee_id) {
      console.log('[/api/otp/verify] Existing profile has default name or missing employee_id, updating');
      // Update existing profile if it has default name or missing employee_id
      let employee: any = null;
      const phoneFields = ['phone_number', 'phone'];
      
      for (const phoneField of phoneFields) {
        const result = await admin
          .from("employees")
          .select("id, full_name, first_name, last_name, department")
          .eq(phoneField, otpData.phone_number)
          .maybeSingle();
        if (result.data) {
          console.log('[/api/otp/verify] Employee found for update with field:', phoneField);
          employee = result.data;
          break;
        }
      }

      // Fallback: try to find employee by user_id
      if (!employee) {
        console.log('[/api/otp/verify] Trying to find employee by user_id:', userId);
        const byUserId = await admin
          .from("employees")
          .select("id, full_name, first_name, last_name, department")
          .eq("user_id", userId)
          .maybeSingle();
        if (byUserId.data) {
          console.log('[/api/otp/verify] Employee found by user_id');
          employee = byUserId.data as any;
        }
      }

      // Additional fallback: try to extract staff ID from phone number and look up by employee_no
      if (!employee) {
        console.log('[/api/otp/verify] Trying to find employee by extracting staff ID from context');
        // Try to get user by ID from auth
        try {
          const { data: { user } } = await admin.auth.getUser(userId);
          if (user?.email && user.email.includes('@staff.gtpea.local')) {
            const staffId = user.email.split('@')[0];
            console.log('[/api/otp/verify] Extracted staff_id from email:', staffId);
            const byStaffId = await admin
              .from("employees")
              .select("id, full_name, first_name, last_name, department")
              .eq("employee_no", staffId)
              .maybeSingle();
            if (byStaffId.data) {
              console.log('[/api/otp/verify] Employee found by staff_id');
              employee = byStaffId.data as any;
            } else {
              console.log('[/api/otp/verify] No employee found by staff_id, updating profile with staff ID name');
              // Update profile with a more meaningful name using staff ID
              const fallbackName = `Staff ${staffId}`;
              await admin
                .from("profiles")
                .update({
                  full_name: fallbackName,
                })
                .eq("user_id", userId);
              console.log('[/api/otp/verify] Updated profile name to:', fallbackName);
            }
          }
        } catch (error) {
          console.log('[/api/otp/verify] Could not get user by ID:', error);
        }
      }

      if (employee) {
        console.log('[/api/otp/verify] Employee found for update:', employee);
        // Use full_name if available, otherwise construct from first_name and last_name
        const fullName = employee.full_name || 
                         (employee.first_name && employee.last_name ? 
                          `${employee.first_name} ${employee.last_name}` : 
                          existingProfile.full_name);
        
        await admin
          .from("profiles")
          .update({
            employee_id: employee.id,
            full_name: fullName,
          })
          .eq("user_id", userId);
        console.log('[/api/otp/verify] Updated profile with employee_id:', employee.id, 'and name:', fullName);
      } else {
        console.log('[/api/otp/verify] No employee found for profile update');
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
