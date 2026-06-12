export function getActiveNavPath(pathname: string, paths: string[]): string | null {
  const normalized = pathname.split("?")[0];
  const sorted = [...paths].sort((a, b) => b.length - a.length);

  for (const path of sorted) {
    if (path === "/dashboard") {
      if (normalized === "/dashboard") return path;
      continue;
    }
    if (normalized === path || normalized.startsWith(`${path}/`)) {
      return path;
    }
  }

  return null;
}

export function isNavItemActive(pathname: string, itemPath: string, allPaths: string[]): boolean {
  return getActiveNavPath(pathname, allPaths) === itemPath;
}

const ROLE_LABEL_MAP: Record<string, string> = {
  super_admin: "Administrator",
  administrator: "Administrator",
  fund_manager: "Fund Manager",
  chairperson: "Chairperson",
  union_rep: "Union Representative",
  employee: "Employee",
};

export function formatRoleLabel(role: string): string {
  return ROLE_LABEL_MAP[role] ?? role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
