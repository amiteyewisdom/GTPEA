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

  return (
    <ProfileClient
      profile={profile}
      email={user?.email ?? ""}
    />
  );
}
