'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  DollarSign, 
  PiggyBank, 
  Wallet,
  FileText, 
  Activity,
  Settings,
  LogOut,
  User,
  CheckCircle,
  Star,
  Calendar,
  BarChart3,
  Upload,
  CreditCard,
  Home,
  Briefcase,
  History,
  ClipboardList,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { getMenuItemsForRole, MenuItem, UserRole } from '@/lib/role-menus';

interface EnterpriseSidebarProps {
  currentRole: UserRole;
  userName?: string;
  userAvatar?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function EnterpriseSidebar({ 
  currentRole, 
  userName = 'User', 
  userAvatar,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}: EnterpriseSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = getMenuItemsForRole(currentRole);

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose?.();
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const sidebarWidth = isCollapsed ? '80px' : '280px';

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bg-white z-50 border-r border-brand-card-border
          transition-all duration-300 ease-in-out h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
        `}
        style={{ width: isCollapsed ? '80px' : '280px' }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-brand-card-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-brand-accent rounded-full flex items-center justify-center text-brand-accent font-bold text-xl bg-brand-card-bg backdrop-blur-glass flex-shrink-0">
                C
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <h1 className="text-brand-text font-bold text-lg leading-tight">
                    GTPEA <span className="text-brand-accent">Finance</span>
                  </h1>
                  <span className="text-brand-text-secondary text-xs mt-0.5">
                    {currentRole.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-lg bg-brand-hover border border-brand-card-border text-brand-text-secondary hover:text-brand-text transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-brand
                    transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text'
                    }
                  `}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-green rounded-r-full" />
                  )}

                  <Icon className="w-5 h-5 flex-shrink-0" />

                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap">
                      {item.label}
                    </span>
                  )}

                  {!isCollapsed && isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-brand-green" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-brand-card-border">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-text font-medium text-sm truncate">
                      {userName}
                    </p>
                    <p className="text-brand-text-secondary text-xs truncate">
                      {currentRole.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-brand bg-brand-hover border border-brand-card-border text-brand-text-secondary hover:bg-brand-card-border hover:text-brand-text transition-all text-xs font-medium"
                  >
                    <User className="w-4 h-4" />
                    {!isCollapsed && <span>Profile</span>}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-brand bg-brand-danger/10 border border-brand-danger/30 text-brand-danger hover:bg-brand-danger/20 transition-all text-xs font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {!isCollapsed && <span>Logout</span>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-brand bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Collapse Toggle (Desktop) */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex fixed left-0 bottom-6 z-50 items-center justify-center w-8 h-8 bg-brand-green rounded-r-lg shadow-lg hover:bg-brand-green-dark transition-all"
          style={{ left: sidebarWidth }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          )}
        </button>
      )}
    </>
  );
}
