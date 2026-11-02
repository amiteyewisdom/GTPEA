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
