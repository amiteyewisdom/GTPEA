import { createClient } from "@/lib/supabase/server";
import { LoanApplication } from "@/features/loans/LoanApplication";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Apply for Loan" };

export default async function ApplyLoanPage() {
  const supabase = await createClient();
  const { data: loanProducts } = await supabase
    .from("loan_products")
    .select("id, name, interest_rate, min_amount, max_amount, max_term_months")
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-brand-text md:text-3xl">Apply for Loan</h1>
        <p className="text-sm text-brand-text-secondary md:text-base">
          Submit a new loan application
        </p>
      </div>
      <LoanApplication loanProducts={loanProducts ?? []} />
    </div>
  );
}
