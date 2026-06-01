import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UnionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const members = [
    "John Mensah",
    "Sarah Arthur",
    "Michael Owusu",
  ];

  const requests = [
    "Loan approval pending",
    "Savings withdrawal approved",
  ];

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-8">
      <h1 className="text-4xl font-bold mb-8">
        Union Representative Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Member List
          </h2>

          <div className="space-y-3">
            {members.map((member, i) => (
              <div
                key={i}
                className="border rounded-2xl p-4"
              >
                {member}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Approval Tracking
          </h2>

          <div className="space-y-3">
            {requests.map((req, i) => (
              <div
                key={i}
                className="border rounded-2xl p-4"
              >
                {req}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
