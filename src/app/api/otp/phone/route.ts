import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Returns the logged-in user's phone for the OTP screen. Uses the admin
// client so RLS on employees/profiles can't make the lookup silently fail.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    const admin = createAdminClient();

    // 1) employee record by auth email
    if (user.email) {
      const { data: emp } = await (admin.from("employees") as any)
        .select("phone, phone_number")
        .eq("email", user.email)
        .maybeSingle();
      const phone = emp?.phone_number || emp?.phone;
      if (phone) {
        return NextResponse.json({ phone });
      }

      // 2) employee by staff id embedded in @staff.gtpea.local email
      if (user.email.includes("@staff.gtpea.local")) {
        const staffId = user.email.split("@")[0];
        const { data: empByNo } = await (admin.from("employees") as any)
          .select("phone, phone_number")
          .eq("employee_no", staffId)
          .maybeSingle();
        const p2 = empByNo?.phone_number || empByNo?.phone;
        if (p2) {
          return NextResponse.json({ phone: p2 });
        }
      }
    }

    // 3) profile fallback
    const { data: profile } = await (admin.from("profiles") as any)
      .select("phone")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile?.phone) {
      return NextResponse.json({ phone: profile.phone });
    }

    return NextResponse.json({ error: "Phone number not found. Please contact support." }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error." }, { status: 500 });
  }
}
