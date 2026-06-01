import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChairPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const approvals = [
    "Loan request from Textile Union",
    "Emergency fund request",
  ];

  const meetings = [
    "Executive board meeting - Friday",
    "Quarterly finance review",
  ];

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-8">
      <h1 className="text-4xl font-bold mb-2">
        Chairperson Dashboard
      </h1>

      <p className="text-slate-500 mb-8">
        Welcome back, {profile?.full_name}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Pending Approvals
          </h2>

          <div className="space-y-3">
            {approvals.map((item, i) => (
              <div
                key={i}
                className="border p-4 rounded-2xl"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Meeting Schedule
          </h2>

          <div className="space-y-3">
            {meetings.map((meeting, i) => (
              <div
                key={i}
                className="border p-4 rounded-2xl"
              >
                {meeting}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
            }
