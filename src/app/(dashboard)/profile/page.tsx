import { createClient } from "@/lib/supabase/server";
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

  const { data: employee } = await supabase
    .from("employees")
    .select("guarantor_status, guarantor_application_date")
    .eq("user_id", user!.id)
    .maybeSingle();

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
    guarantor_status: guarantorStatus
  } : null;

  return (
    <ProfileClient
      profile={profileWithGuarantor}
    />
  );
}
