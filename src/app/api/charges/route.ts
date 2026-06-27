// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, employees(first_name, last_name, employee_no)")
    .in("type", ["fee", "penalty"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ charges: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { employee_id, type, amount, description, reference } = body;

  if (!employee_id || !type || !amount) {
    return NextResponse.json({ error: "Employee, type and amount are required." }, { status: 400 });
  }
  if (!["fee", "penalty"].includes(type)) {
    return NextResponse.json({ error: "Type must be 'fee' or 'penalty'." }, { status: 400 });
  }
  if (Number(amount) <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Get employee's current savings balance as balance_before
  const { data: savings } = await supabase
    .from("savings")
    .select("balance")
    .eq("employee_id", employee_id)
    .maybeSingle();

  const balanceBefore = Number(savings?.balance) || 0;

  const ref = reference?.trim() ||
    `${type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const { data: charge, error } = await supabase
    .from("transactions")
    .insert([{
      employee_id,
      type,
      amount: Number(amount),
      balance_before: balanceBefore,
      balance_after: balanceBefore,
      description: description ? String(description).trim() : `${type === "fee" ? "Processing fee" : "Penalty charge"}`,
      reference: ref,
      related_id: null,
      related_type: null,
      performed_by: user.id,
    }])
    .select("*, employees(first_name, last_name, employee_no)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Charge recorded.", charge });
}
