import { NextResponse } from "next/server";
import { canManageUsers, getStaffUser } from "@/lib/api/staff-auth";
import { getUserImportTemplate } from "@/lib/imports/process-users";

export async function GET() {
  const { role } = await getStaffUser();

  if (!canManageUsers(role)) {
    return NextResponse.json({ error: "You do not have permission to download this template." }, { status: 403 });
  }

  const csv = getUserImportTemplate();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="gtpea_users_template.csv"`,
    },
  });
}
