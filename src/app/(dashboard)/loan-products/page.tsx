import { createClient } from "@/lib/supabase/server";
import { LoanProductsClient } from "@/features/loan-products/LoanProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Loan Products" };

export default async function LoanProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("loan_products")
    .select("*")
    .order("created_at", { ascending: false });

  return <LoanProductsClient products={products ?? []} />;
}
