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
    .select("guarantor_status")
    .eq("user_id", user!.id)
    .maybeSingle();

  const typedProfile = profile as any;
  const typedEmployee = employee as any;

  const profileWithGuarantor = typedProfile ? {
    ...typedProfile,
    guarantor_status: typedEmployee?.guarantor_status || null
  } : null;

  return (
    <ProfileClient
      profile={profileWithGuarantor}
      email={user?.email ?? ""}
    />
  );
}
