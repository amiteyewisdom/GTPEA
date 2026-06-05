'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  DollarSign, 
  PiggyBank, 
  Briefcase, 
  User,
  Settings
} from 'lucide-react';
import { UserRole, getMenuItemsForRole } from '@/lib/role-menus';

interface MobileBottomNavProps {
  currentRole: UserRole;
}

export default function MobileBottomNav({ currentRole }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuItems = getMenuItemsForRole(currentRole);

  // Get first 5 menu items for bottom nav
  const bottomNavItems = menuItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-sidebar border-t border-brand-card-border z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all
                ${isActive 
                  ? 'text-brand-accent' 
                  : 'text-brand-text-secondary hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        
        {/* More button for additional menu items */}
        {menuItems.length > 5 && (
          <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-brand-text-secondary hover:text-white transition-all">
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        )}
      </div>
    </nav>
  );
}
