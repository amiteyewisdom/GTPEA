// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const type = String(body?.type);
  const dateFrom = String(body?.date_from);
  const dateTo = String(body?.date_to);

  if (!type || !["full_account", "savings", "loan", "dividend"].includes(type)) {
    return NextResponse.json({ error: "Invalid statement type." }, { status: 400 });
  }

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "Date range is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Get employee ID from user
  const { data: profile } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("user_id", user.id)
    .single() as any;

  if (!profile?.employee_id) {
    return NextResponse.json({ error: "Employee profile not found." }, { status: 400 });
  }

  // Create statement request
  const { data: statement, error: statementError } = await supabase
    .from("statement_requests")
    .insert([
      {
        employee_id: profile.employee_id,
        type: type,
        date_from: dateFrom,
        date_to: dateTo,
        status: "pending",
      },
    ] as any)
    .select()
    .single() as any;

  if (statementError || !statement) {
    return NextResponse.json({ error: statementError?.message || "Failed to create statement request." }, { status: 500 });
  }

  return NextResponse.json({ message: "Statement request submitted successfully", statement });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: statements } = await supabase
    .from("statement_requests")
    .select("*, employees (first_name, last_name)")
    .order("requested_at", { ascending: false });

  return NextResponse.json({ statements: statements ?? [] });
}
