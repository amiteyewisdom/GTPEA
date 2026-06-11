import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/api/staff-auth";
import { fetchDashboardStats } from "@/lib/dashboard/fetch-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, role } = await getStaffUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!role || role === "employee") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stats = await fetchDashboardStats();
  return NextResponse.json(stats);
}
