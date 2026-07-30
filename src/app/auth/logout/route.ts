import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.json({ success: true });
  response.cookies.set("gtpea_otp_verified", "", { path: "/", maxAge: 0 });
  return response;
}
