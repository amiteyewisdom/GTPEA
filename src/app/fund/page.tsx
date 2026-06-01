import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function FundPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const transactions = [
    "Disbursed GHS 12,000",
    "Approved employee payout",
    "Transferred reserve funds",
  ];

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-8">
      <h1 className="text-4xl font-bold mb-8">
        Fund Manager Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card title="Fund Balance" value="GHS 1.2M" />
        <Card title="Pending Payouts" value="14" />
        <Card title="Transactions" value="320" />
      </div>

      <section className="bg-white rounded-3xl p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Recent Transactions
        </h2>

        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <div
              key={i}
              className="border rounded-2xl p-4"
            >
              {tx}
            </div>
          ))}
        </div>
      </section>
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
