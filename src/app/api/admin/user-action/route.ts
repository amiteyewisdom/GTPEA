import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteEmployeeAccount } from "@/lib/api/delete-account";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required." },
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
        { error: "Only super admins can perform user actions." },
        { status: 403 }
      );
    }

    // Prevent super admin from deleting themselves
    if (action === "delete" && userId === user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    switch (action) {
      case "suspend":
        const { error: suspendError } = await admin
          .from("profiles")
          .update({ is_suspended: true, suspended_at: new Date().toISOString() })
          .eq("user_id", userId);

        if (suspendError) {
          return NextResponse.json(
            { error: "Failed to suspend user." },
            { status: 500 }
          );
        }

        // Keep the linked employee record's status in sync
        await admin
          .from("employees")
          .update({ status: "suspended" })
          .eq("email", (await admin.auth.admin.getUserById(userId)).data.user?.email ?? "");

        // Ban the auth user — blocks login without deleting the account.
        // (This used to deleteUser(), which destroyed the account for good.)
        await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" } as any);

        return NextResponse.json({
          success: true,
          message: "User suspended successfully",
        });

      case "unsuspend":
        const { error: unsuspendError } = await admin
          .from("profiles")
          .update({ is_suspended: false, suspended_at: null })
          .eq("user_id", userId);

        if (unsuspendError) {
          return NextResponse.json(
            { error: "Failed to unsuspend user." },
            { status: 500 }
          );
        }

        await admin
          .from("employees")
          .update({ status: "active" })
          .eq("email", (await admin.auth.admin.getUserById(userId)).data.user?.email ?? "");

        // Lift the auth ban
        await admin.auth.admin.updateUserById(userId, { ban_duration: "none" } as any);

        return NextResponse.json({
          success: true,
          message: "User unsuspended successfully",
        });

      case "revoke_role":
        const { error: revokeError } = await admin
          .from("profiles")
          .update({ role: "employee" })
          .eq("user_id", userId);

        if (revokeError) {
          return NextResponse.json(
            { error: "Failed to revoke role." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Role revoked successfully",
        });

      case "delete":
        {
          const { data: targetAuth } = await admin.auth.admin.getUserById(userId);
          const targetEmail = targetAuth.user?.email ?? null;

          // If the account is linked to an employee, run the full cascade
          // (financial records, approvals, profile, auth user, employee row).
          const { data: linkedEmployee } = await (admin
            .from("employees") as any)
            .select("id")
            .eq("email", targetEmail)
            .maybeSingle();

          if (linkedEmployee) {
            const result = await deleteEmployeeAccount(admin, linkedEmployee.id, user.id);
            if (result.error) {
              return NextResponse.json({ error: result.error }, { status: result.status });
            }
          } else {
            // Pure admin account with no employee record
            await (admin.from("impersonation_sessions") as any).delete().eq("target_user_id", userId);
            await admin.from("profiles").delete().eq("user_id", userId);
            await admin.auth.admin.deleteUser(userId);
            await (admin.from("audit_logs") as any).insert({
              action: "USER_DELETED",
              entity_type: "user",
              entity_id: userId,
              performed_by: user.id,
              details: { email: targetEmail },
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: "User deleted successfully",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action." },
          { status: 400 }
        );
    }
  } catch (err: any) {
    console.error("[/api/admin/user-action] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
