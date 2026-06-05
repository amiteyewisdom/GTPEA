import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SettingsPage from "@/features/settings/SettingsPage";
import { UserRole } from "@/lib/role-menus";

export const metadata: Metadata = { title: "Settings" };

export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("user_id", user.id)
    .single() as any;

  const role = (profile?.role as UserRole) ?? "employee";
  const userName = profile?.full_name ?? user.email ?? "User";

  return <SettingsPage currentRole={role} />;
}
