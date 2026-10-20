import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/api/staff-auth";

// Global search for the topbar. Runs under the caller's session, so RLS
// scopes results automatically — staff see everything, employees only
// their own records.
export async function GET(request: Request) {
  const { supabase, user } = await getStaffUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ employees: [], loans: [], savings: [] });
  }

  const term = `%${q.replace(/[%_,]/g, "")}%`;

  const [employees, loans, savings] = await Promise.all([
    (supabase.from("employees") as any)
      .select("id, employee_no, first_name, last_name, department")
      .or(`first_name.ilike.${term},last_name.ilike.${term},employee_no.ilike.${term}`)
      .order("employee_no", { ascending: true })
      .limit(6),
    (supabase.from("loans") as any)
      .select("id, loan_ref, status, outstanding_balance, employees!loans_employee_id_fkey(first_name, last_name, employee_no)")
      .ilike("loan_ref", term)
      .order("created_at", { ascending: false })
      .limit(6),
    (supabase.from("savings") as any)
      .select("id, account_number, type, balance, employees(first_name, last_name, employee_no)")
      .ilike("account_number", term)
      .order("opened_at", { ascending: false })
      .limit(6),
  ]);

  return NextResponse.json({
    employees: employees.data ?? [],
    loans: loans.data ?? [],
    savings: savings.data ?? [],
  });
}
