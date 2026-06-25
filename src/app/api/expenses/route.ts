// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ expenses: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, category, amount, expense_date, description, paid_to, receipt_ref } = body;

  if (!title || !category || !amount || !expense_date) {
    return NextResponse.json({ error: "Title, category, amount and date are required." }, { status: 400 });
  }
  if (Number(amount) <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert([{
      title: String(title),
      category: String(category),
      amount: Number(amount),
      expense_date: String(expense_date),
      description: description ? String(description) : null,
      paid_to: paid_to ? String(paid_to) : null,
      receipt_ref: receipt_ref ? String(receipt_ref) : null,
      recorded_by: user.id,
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Expense recorded.", expense });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Expense deleted." });
}
