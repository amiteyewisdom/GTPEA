import { NextResponse } from "next/server";
import { canImpersonate, getStaffUser } from "@/lib/api/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_USER_PASSWORD } from "@/lib/imports/process-users";

export async function POST(request: Request) {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to impersonate users." }, { status: 401 });
  }

  if (!canImpersonate(role)) {
    return NextResponse.json({ error: "Only super admins can impersonate users." }, { status: 403 });
  }

  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Get the employee's auth user
    const { data: employee } = await adminSupabase
      .from("employees")
      .select("email, first_name, last_name, id")
      .eq("id", employeeId)
      .single();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Find the auth user by email (search through all pages)
    let authUser: any = null;
    let page = 1;
    const maxPages = 10;
    
    while (page <= maxPages && !authUser) {
      const { data: authUsers } = await adminSupabase.auth.admin.listUsers({
        page: page,
        perPage: 100,
      });
      
      authUser = authUsers.users.find((u: any) => u.email.toLowerCase() === employee.email.toLowerCase());
      
      if (authUsers.users.length < 100) {
        break;
      }
      page++;
    }

    // If auth user doesn't exist, create them with a default password
    if (!authUser) {
      try {
        const defaultPassword = DEFAULT_USER_PASSWORD;
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
          email: employee.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: `${employee.first_name} ${employee.last_name}`,
            employee_id: employee.id,
            role: "employee",
          },
        });

        if (createError) {
          if (createError.message?.includes("email_exists") || createError.code === "email_exists") {
            page = 1;
            while (page <= maxPages && !authUser) {
              const { data: retryAuthUsers } = await adminSupabase.auth.admin.listUsers({
                page: page,
                perPage: 100,
              });
              
              authUser = retryAuthUsers.users.find((u: any) => u.email.toLowerCase() === employee.email.toLowerCase());
              
              if (retryAuthUsers.users.length < 100) {
                break;
              }
              page++;
            }
            
            if (!authUser) {
              return NextResponse.json({ error: "User account exists but could not be found." }, { status: 404 });
            }
          } else {
            return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
          }
        } else {
          authUser = newUser.user;
        }
      } catch (error) {
        return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
      }
    }

    // Log the impersonation for audit purposes
    await adminSupabase.from("audit_logs").insert({
      action: "impersonate",
      actor_id: user.id,
      actor_role: role,
      target_user_id: authUser.id,
      target_employee_id: employeeId,
      metadata: { impersonated_email: employee.email },
    });

    // Generate a real magic-link login token for the target user. The client
    // exchanges it via supabase.auth.verifyOtp → a genuine session as that
    // user (the old "token" only painted a banner over the admin's session).
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email: employee.email,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      return NextResponse.json(
        { error: "Failed to create login session for this user." },
        { status: 500 }
      );
    }

    // Don't leave an unverified account stuck on the OTP screen for the admin
    await adminSupabase
      .from("profiles")
      .update({ otp_verified_at: new Date().toISOString() } as any)
      .eq("user_id", authUser.id)
      .is("otp_verified_at", null);

    return NextResponse.json({
      success: true,
      tokenHash: linkData.properties.hashed_token,
      employee_email: employee.email,
      employee_name: `${employee.first_name} ${employee.last_name}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impersonation failed." },
      { status: 500 }
    );
  }
}
