const VALID_DEPARTMENTS = ["management", "finance", "operations", "hr", "it", "sales", "legal", "audit", "retail", "marketing", "supply chain", "wholesale"] as const;

type Department = (typeof VALID_DEPARTMENTS)[number];

export function normalizeDepartment(input: string): Department {
  const raw = input.trim().toLowerCase().replace(/[&\/_-]/g, " ");

  const aliases: Record<string, string[]> = {
    management: ["management", "mgt", "mgr", "managerial"],
    finance: ["finance", "fin", "account", "accounts", "accounting", "bac"],
    operations: [
      "operations",
      "ops",
      "operational",
      "procurement",
      "warehouse",
      "logistics",
      "admin",
      "administration",
      "support",
      "user support",
      "customer support",
      "general services",
      "gs",
      "planning",
      "data kitchen",
      "color kitchen",
      "kitchen",
    ],
    hr: ["hr", "human resources", "human resource", "personnel"],
    it: ["it", "information technology", "information tech", "tech", "technology", "engineering"],
    sales: ["sales", "marketing", "business development", "biz dev"],
    legal: ["legal", "compliance"],
    audit: ["audit", "internal audit"],
    retail: ["retail", "retail sales"],
    marketing: ["marketing", "market", "promotions"],
    "supply chain": ["supply chain", "supply", "logistics", "procurement"],
    wholesale: ["wholesale", "wholesale sales"],
  };

  if (VALID_DEPARTMENTS.includes(raw as Department)) return raw as Department;

  for (const [department, departmentAliases] of Object.entries(aliases)) {
    if (departmentAliases.includes(raw)) return department as Department;
  }

  return "operations";
}

export function normalizeLoanProductName(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, " ");
  const aliases: Record<string, string> = {
    "regular loan": "normal loan",
  };

  return aliases[normalized] ?? normalized;
}

export function resolveEmployeeNo(row: Record<string, string>): string {
  const numberValue = String(row["no."] ?? row["no"] ?? row["num"] ?? row["number"] ?? "").trim();
  const coyValue = String(row["coy"] ?? row["cop"] ?? row["company"] ?? "").trim().toUpperCase();
  if (coyValue && numberValue) return `${coyValue}${numberValue}`;
  const unoValue = String(row["uno"] ?? row["union no"] ?? row["union number"] ?? "").trim();
  if (unoValue) return unoValue;
  return String(
    row["employee no"] ??
    row["employee id"] ??
    row["staff id"] ??
    row["emp numb"] ??
    row["emp number"] ??
    row["employee number"] ??
    ""
  ).trim();
}

export function resolveEmployeeName(row: Record<string, string>): { firstName: string; lastName: string } {
  const fullName = String(
    row["payee name"] ||
    row["hr name"] ||
    row["staff name"] ||
    row["surname & othernames"] ||
    (row["first name"] ? `${row["first name"]} ${row["last name"] ?? ""}`.trim() : "") ||
    row.name ||
    ""
  ).trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
}
