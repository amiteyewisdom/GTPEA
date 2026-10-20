"use client";

import { useRouter } from "next/navigation";
import { Repeat } from "lucide-react";
import { formatRoleLabel } from "@/lib/navigation";

type Props = {
  baseRole: string;
  currentView: "board" | "employee";
};

// Lets a board member who is also a staff employee flip between the board
// interface and their employee interface. Stores the choice in the
// gtpea_view cookie; the dashboard layout resolves the effective role.
export default function ViewSwitcher({ baseRole, currentView }: Props) {
  const router = useRouter();

  const switchView = () => {
    const next = currentView === "employee" ? "board" : "employee";
    document.cookie = `gtpea_view=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  };

  const label =
    currentView === "employee"
      ? `Switch to ${formatRoleLabel(baseRole)}`
      : "Switch to Employee";

  return (
    <button
      type="button"
      onClick={switchView}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-card-border px-3 py-2 text-xs font-semibold text-brand-text-secondary hover:bg-brand-hover hover:text-brand-green transition-colors"
      title={currentView === "employee" ? "Return to your board interface" : "View your employee account"}
    >
      <Repeat className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{currentView === "employee" ? "Board" : "Staff"}</span>
    </button>
  );
}
