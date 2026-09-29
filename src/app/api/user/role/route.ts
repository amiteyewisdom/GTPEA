import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/api/staff-auth";

export async function GET() {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ role });
}
