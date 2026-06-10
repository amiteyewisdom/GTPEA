// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReference } from "@/utils/formatters";

export async function POST(request: Request) {
  const body = await request.json();
  const fiscalYear = Number(body?.fiscal_year);
  const ratePercent = Number(body?.rate_percent);
  const basis = String(body?.basis || "average_savings");
  const totalPool = Number(body?.total_pool);

  if (!fiscalYear || fiscalYear < 2000 || fiscalYear > 2100) {
    return NextResponse.json({ error: "Invalid fiscal year." }, { status: 400 });
  }

  if (!ratePercent || ratePercent < 0 || ratePercent > 100) {
    return NextResponse.json({ error: "Rate must be between 0 and 100." }, { status: 400 });
  }

  if (!["average_savings", "year_end_balance", "shares"].includes(basis)) {
    return NextResponse.json({ error: "Invalid basis." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Check if dividend config for this year already exists
  const { data: existingConfig } = await supabase
    .from("dividend_configs")
    .select("id")
    .eq("fiscal_year", fiscalYear)
    .single();

  if (existingConfig) {
    return NextResponse.json({ error: "Dividend config for this fiscal year already exists." }, { status: 400 });
  }

  // Create dividend config
  const { data: config, error: configError } = await supabase
    .from("dividend_configs")
    .insert([
      {
        fiscal_year: fiscalYear,
        rate_percent: ratePercent,
        basis: basis,
        total_pool: totalPool || null,
        status: "draft",
        created_by: user.id,
      },
    ] as any)
    .select()
    .single() as any;

  if (configError || !config) {
    return NextResponse.json({ error: configError?.message || "Failed to create dividend config." }, { status: 500 });
  }

  return NextResponse.json({ message: "Dividend config created successfully", config });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: configs } = await supabase
    .from("dividend_configs")
    .select("*")
    .order("fiscal_year", { ascending: false });

  return NextResponse.json({ configs: configs ?? [] });
}
