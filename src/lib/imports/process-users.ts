import { parseCsv } from "@/lib/csv";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

const VALID_ROLES = [
  "super_admin",
  "administrator",
  "fund_manager",
  "chairperson",
  "union_rep",
  "employee",
] as const;

type UserRole = (typeof VALID_ROLES)[number];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizeRole(input: string): UserRole | null {
  const raw = input.trim().toLowerCase().replace(/\s+/g, "_");
  if (VALID_ROLES.includes(raw as UserRole)) return raw as UserRole;

  const aliases: Record<string, UserRole> = {
    admin: "administrator",
    superadmin: "super_admin",
    "super admin": "super_admin",
    manager: "fund_manager",
    "fund manager": "fund_manager",
    chair: "chairperson",
    chairman: "chairperson",
    chairperson: "chairperson",
    rep: "union_rep",
    "union rep": "union_rep",
    "union representative": "union_rep",
    staff: "employee",
    member: "employee",
  };

  return aliases[raw] ?? null;
}

export async function importUsers(fileText: string): Promise<UserImportResult> {
  const rows = parseCsv(fileText);
  if (rows.length === 0) {
    return { imported: 0, skipped: 0, errors: ["The file is empty or has no data rows."] };
  }

  const adminClient = createAdminClient();
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Pre-fetch existing auth users by email to avoid duplicates
  const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    return { imported: 0, skipped: 0, errors: [`Could not verify existing users: ${listError.message}`] };
  }

  const existingEmails = new Set(
    (existingUsers?.users ?? []).map((u: any) => (u.email || "").toLowerCase())
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNo = i + 2;

    const email = (row.email || "").trim();
    const firstName = (row["first name"] || row.firstname || "").trim();
    const lastName = (row["last name"] || row.lastname || "").trim();
    const phone = (row.phone || row["phone number"] || "").trim() || null;
    const role = normalizeRole(row.role || "");
    const employeeNo = (row["employee no"] || row["employee id"] || "").trim() || null;
    const active = (row.active || row.status || "yes").toString().trim().toLowerCase();
    const isActive = ["yes", "y", "true", "active", "1"].includes(active);

    if (!email || !firstName || !lastName || !role) {
      skipped++;
      errors.push(`Row ${rowNo}: email, first name, last name, and role are required.`);
      continue;
    }

    if (!isValidEmail(email)) {
      skipped++;
      errors.push(`Row ${rowNo}: email "${email}" is invalid.`);
      continue;
    }

    if (existingEmails.has(email.toLowerCase())) {
      skipped++;
      errors.push(`Row ${rowNo}: user with email "${email}" already exists.`);
      continue;
    }

    let employeeId: string | null = null;
    if (employeeNo) {
      const { data: employee } = await adminClient
        .from("employees")
        .select("id")
        .eq("employee_no", employeeNo)
        .single();
      if (!employee) {
        skipped++;
        errors.push(`Row ${rowNo}: employee "${employeeNo}" not found.`);
        continue;
      }
      employeeId = employee.id;
    }

    // Create auth user with a temporary password
    const temporaryPassword = `GTPEA${Date.now().toString(36).slice(-6)}!`;
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (authError || !authUser.user) {
      skipped++;
      errors.push(`Row ${rowNo}: could not create auth user — ${authError?.message || "unknown error"}.`);
      continue;
    }

    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: authUser.user.id,
      full_name: `${firstName} ${lastName}`,
      role,
      phone,
      employee_id: employeeId,
      is_active: isActive,
    });

    if (profileError) {
      // Roll back auth user creation on profile failure
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      skipped++;
      errors.push(`Row ${rowNo}: could not create profile — ${profileError.message}.`);
      continue;
    }

    existingEmails.add(email.toLowerCase());
    imported++;
  }

  return { imported, skipped, errors };
}

export function getUserImportTemplate(): string {
  const headers = [
    "Email",
    "First Name",
    "Last Name",
    "Phone Number",
    "Role",
    "Employee No",
    "Active",
  ];
  const sample = [
    "jane.doe@example.com",
    "Jane",
    "Doe",
    "0240000000",
    "employee",
    "EMP-002",
    "yes",
  ];
  return [headers.join(","), sample.join(",")].join("\n");
}

export type ExportableUser = {
  name: string;
  email?: string;
  role: string;
  employeeId: string;
  status: string;
  joined: string;
};

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportUsersToCsv(users: ExportableUser[]): string {
  const headers = ["Name", "Email", "Role", "Employee ID", "Status", "Joined"];
  const rows = users.map((user) =>
    [
      escapeCsv(user.name),
      escapeCsv(user.email || ""),
      escapeCsv(user.role),
      escapeCsv(user.employeeId),
      escapeCsv(user.status),
      escapeCsv(user.joined),
    ].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
