import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const pendingUnionReps = [
    { id: 1, name: "Kwame Mensah", union: "GTPEA" },
    { id: 2, name: "Akosua Arthur", union: "Textile Union" },
  ];

  const auditLogs = [
    "Admin approved fund request",
    "Union rep account created",
    "Chairperson updated meeting",
  ];

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Welcome back, {profile?.full_name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card title="Total Users" value="1,248" />
        <Card title="Pending Approvals" value="18" />
        <Card title="Active Funds" value="24" />
        <Card title="Audit Events" value="312" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Pending Union Rep Approvals
          </h2>

          <div className="space-y-4">
            {pendingUnionReps.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between border rounded-2xl p-4"
              >
                <div>
                  <p className="font-semibold">{rep.name}</p>
                  <p className="text-sm text-slate-500">{rep.union}</p>
                </div>

                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-xl">
                    Approve
                  </button>

                  <button className="bg-red-600 text-white px-4 py-2 rounded-xl">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>

          <div className="space-y-3">
            {auditLogs.map((log, index) => (
              <div
                key={index}
                className="border rounded-xl p-3 text-slate-600"
              >
                {log}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <p className="text-slate-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
            }
