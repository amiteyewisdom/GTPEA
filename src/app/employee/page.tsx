import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EmployeePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const requests = [
    {
      title: "Loan Request",
      status: "Pending",
    },
    {
      title: "Savings Withdrawal",
      status: "Approved",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-8">
      <h1 className="text-4xl font-bold mb-8">
        Employee Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            My Requests
          </h2>

          <div className="space-y-3">
            {requests.map((req, i) => (
              <div
                key={i}
                className="border rounded-2xl p-4 flex justify-between"
              >
                <span>{req.title}</span>
                <span className="font-medium text-blue-600">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Payslip
          </h2>

          <div className="border rounded-2xl p-6">
            <p className="text-slate-500">Monthly Salary</p>
            <h3 className="text-3xl font-bold mt-2">
              GHS 8,500
            </h3>
          </div>
        </section>
      </div>
    </main>
  );
}
