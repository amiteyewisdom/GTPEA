import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { redirect } from "next/navigation";
import EnterpriseLayout from "@/components/layout/EnterpriseLayout";
import { UserRole } from "@/lib/role-menus";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileRes = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("user_id", user.id)
    .single();
  const profile = profileRes.data as Profile | null;

  const userInfo = {
    full_name: profile?.full_name ?? user.email ?? "User",
    role: profile?.role ?? "employee",
    avatar_url: profile?.avatar_url ?? null,
    email: user.email ?? "",
  };

  return (
    <EnterpriseLayout 
      currentRole={(profile?.role as UserRole) || 'employee'}
      userName={userInfo.full_name}
      userAvatar={userInfo.avatar_url || undefined}
    >
      {children}
    </EnterpriseLayout>
  );
}
