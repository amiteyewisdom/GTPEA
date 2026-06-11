"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { UserRole, getMenuItemsForRole } from "@/lib/role-menus";
import { isNavItemActive } from "@/lib/navigation";

interface MobileBottomNavProps {
  currentRole: UserRole;
  onOpenMenu: () => void;
}

export default function MobileBottomNav({ currentRole, onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const menuItems = getMenuItemsForRole(currentRole);
  const menuPaths = menuItems.map((item) => item.path);
  const primaryItems = menuItems.slice(0, 4);
  const hasOverflow = menuItems.length > 4;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-card-border bg-white/95 backdrop-blur md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(pathname, item.path, menuPaths);

          return (
            <Link
              key={item.id}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40 ${
                isActive ? "text-brand-green" : "text-brand-text-secondary hover:text-brand-text"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="w-full truncate text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {hasOverflow && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-brand-text-secondary transition-colors hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
            aria-label="Open full navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        )}
      </div>
    </nav>
  );
}
