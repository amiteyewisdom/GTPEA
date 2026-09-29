import { NextResponse } from "next/server";
import { canImpersonate, getStaffUser } from "@/lib/api/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

    // If auth user doesn't exist, create them
    if (!authUser) {
      try {
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
          email: employee.email,
          email_confirm: true,
          user_metadata: {
            full_name: `${employee.first_name} ${employee.last_name}`,
            employee_id: employee.id,
            role: "employee",
          },
        });

        if (createError) {
          if (createError.message?.includes("email_exists") || createError.code === "email_exists") {
            // Search again
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

    // Generate a new session for the target user
    const { data: sessionData, error: sessionError } = await adminSupabase.auth.admin.createSession({
      userId: authUser.id,
    });

    if (sessionError) {
      return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      employee_email: employee.email,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impersonation failed." },
      { status: 500 }
    );
  }
}
