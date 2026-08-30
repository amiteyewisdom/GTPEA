import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

        // Sign out the suspended user
        await admin.auth.admin.deleteUser(userId);

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
        // Delete from profiles
        await admin.from("profiles").delete().eq("user_id", userId);
        
        // Delete from employees (if exists)
        await admin.from("employees").delete().eq("email", (await admin.auth.admin.getUserById(userId)).data.user?.email);
        
        // Delete from auth
        await admin.auth.admin.deleteUser(userId);

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
