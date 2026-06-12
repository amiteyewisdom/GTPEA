import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function isSavingsLockPeriod(): boolean {
  const month = new Date().getMonth() + 1;
  return month >= 1 && month <= 4;
}

export async function POST(request: Request) {
  const body = await request.json();
  const savingsId = String(body?.savings_id || "");
  const newMonthlyContribution = Number(body?.monthly_contribution);

  if (!savingsId) {
    return NextResponse.json({ error: "Savings account ID is required." }, { status: 400 });
  }

  if (!newMonthlyContribution || newMonthlyContribution < 0) {
    return NextResponse.json({ error: "Monthly contribution must be a positive number." }, { status: 400 });
  }

  if (isSavingsLockPeriod()) {
    return NextResponse.json(
      {
        error:
          "Savings contribution changes are locked from January to April. You may change your contribution amount from May onwards.",
        locked: true,
      },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: savings, error: fetchError } = await supabase
    .from("savings")
    .select("id, employee_id, monthly_contribution, status")
    .eq("id", savingsId)
    .single();

  if (fetchError || !savings) {
    return NextResponse.json({ error: "Savings account not found." }, { status: 404 });
  }

  if ((savings as any).status !== "active") {
    return NextResponse.json({ error: "Savings account is not active." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error: updateError } = await (admin.from("savings") as any)
    .update({ monthly_contribution: newMonthlyContribution })
    .eq("id", savingsId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await (admin.from("audit_logs") as any).insert({
    action: "SAVINGS_CONTRIBUTION_UPDATED",
    entity_type: "savings",
    entity_id: savingsId,
    performed_by: user.id,
    details: {
      previous_amount: (savings as any).monthly_contribution,
      new_amount: newMonthlyContribution,
    },
  });

  return NextResponse.json({
    message: "Monthly contribution updated successfully.",
    monthly_contribution: newMonthlyContribution,
  });
}
