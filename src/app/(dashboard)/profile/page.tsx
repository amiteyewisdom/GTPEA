import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileClient } from "@/features/profile/ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  // employees has no user_id column; resolve via profiles.employee_id using the
  // admin client (employees RLS own-record policy does not yet handle UUID employee_id).
  const admin = createAdminClient();
  const employeeRef = (profile as any)?.employee_id as string | null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employeeRef ?? "");
  const { data: employee } = employeeRef
    ? await admin
        .from("employees")
        .select("guarantor_status, guarantor_application_date, employee_no")
        .eq(isUuid ? "id" : "employee_no", employeeRef)
        .maybeSingle()
    : { data: null };

  const typedProfile = profile as any;
  const typedEmployee = employee as any;

  // guarantor_status historically defaulted to 'pending' on all rows; a pending
  // row with no application date is not a real application.
  const guarantorStatus =
    typedEmployee?.guarantor_status === "pending" && !typedEmployee?.guarantor_application_date
      ? null
      : typedEmployee?.guarantor_status || null;

  const profileWithGuarantor = typedProfile ? {
    ...typedProfile,
    guarantor_status: guarantorStatus,
    // Display the human-readable staff number, never the internal employee UUID
    staff_no: typedEmployee?.employee_no ?? (isUuid ? null : employeeRef)
  } : null;

  return (
    <ProfileClient
      profile={profileWithGuarantor}
    />
  );
}
