// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReference } from "@/utils/formatters";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Fetch active employees who do not have a savings account yet
  const { data: existingAccounts } = await supabase.from("savings").select("employee_id");
  const existingIds = (existingAccounts ?? []).map((s: any) => s.employee_id).filter(Boolean);

  let employeesQuery = supabase
    .from("employees")
    .select("id, first_name, last_name, monthly_savings")
    .eq("status", "active");

  if (existingIds.length > 0) {
    employeesQuery = employeesQuery.not("id", "in", `(${existingIds.join(",")})`);
  }

  const { data: employees, error: employeesError } = await employeesQuery;

  if (employeesError) {
    return NextResponse.json({ error: employeesError.message }, { status: 500 });
  }

  const rows = (employees ?? []) as any[];
  if (rows.length === 0) {
    return NextResponse.json({ message: "All active employees already have savings accounts.", created: 0 });
  }

  const now = new Date().toISOString();
  const insertData = rows.map((emp) => ({
    employee_id: emp.id,
    type: "regular",
    status: "active",
    balance: 0,
    interest_rate: 0,
    monthly_contribution: Number(emp.monthly_savings) || 0,
    target_amount: null,
    maturity_date: null,
    account_number: generateReference("SAV"),
    opened_at: now,
    closed_at: null,
    notes: null,
  }));

  const { data: created, error: insertError } = await supabase
    .from("savings")
    .insert(insertData as any)
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Created ${(created ?? []).length} savings account(s).`,
    created: (created ?? []).length,
  });
}
