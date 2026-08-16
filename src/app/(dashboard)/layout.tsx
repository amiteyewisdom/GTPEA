import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/role-menus";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
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
    const role = profile?.role ?? "employee";

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white px-4 py-3">
          <h1 className="text-lg font-bold">GTPEA Finance</h1>
          <p className="text-sm text-gray-600">Role: {role}</p>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard layout error:', error);
    redirect("/login");
  }
}
