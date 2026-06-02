import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Double-check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Double-check Role (Security Layer)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "administrator" && profile?.role !== "super_admin") {
    redirect("/dashboard"); // Kick them back to the router if they aren't admin
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Command Center</h1>
        <p className="text-slate-500">System-wide overview and management</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">Checking...</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Pending Approvals</h3>
          <p className="text-2xl font-bold text-amber-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">System Status</h3>
          <p className="text-2xl font-bold text-emerald-600">Active</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Administrative Tasks</h2>
        </div>
        <div className="p-12 text-center text-slate-400">
          <p>This is where your Admin-only tools go.</p>
          <div className="mt-4 flex justify-center gap-4">
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">Manage Users</button>
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm">System Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
      }
