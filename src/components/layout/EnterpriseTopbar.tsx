'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, Bell, MessageSquare, User, ChevronDown, Shield, Menu, LogOut } from 'lucide-react';

interface EnterpriseTopbarProps {
  userName?: string;
  userRole?: string;
  notificationCount?: number;
  messageCount?: number;
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
  sidebarWidth?: string;
}

export default function EnterpriseTopbar({
  userName = '',
  userRole = '',
  notificationCount = 3,
  messageCount = 5,
  onMenuClick,
  sidebarCollapsed = false,
  sidebarWidth = '280px'
}: EnterpriseTopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        return;
      }
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header 
      className="fixed top-0 right-0 left-0 h-16 bg-white/80 backdrop-blur-glass border-b border-brand-card-border z-40 transition-all duration-300"
      style={{ left: sidebarWidth }}
    >
      <div className="h-full px-6 flex items-center justify-between">

        {/* Hamburger Menu Button (Mobile/Tablet) */}
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 p-2 rounded-lg bg-white border border-brand-card-border text-brand-text hover:bg-brand-hover transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search employees, loans, savings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-brand-card-border rounded-brand text-brand-text placeholder-brand-text-secondary focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-lg bg-white border border-brand-card-border text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text transition-all"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-brand-card-border rounded-brand-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-brand-card-border">
                  <h3 className="text-brand-text font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border-b border-brand-card-border hover:bg-brand-hover cursor-pointer transition-all">
                      <p className="text-brand-text text-sm"></p>
                      <p className="text-brand-text-secondary text-xs mt-1">2 minutes ago</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="relative">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="relative p-2.5 rounded-lg bg-white border border-brand-card-border text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              {messageCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {messageCount}
                </span>
              )}
            </button>

            {/* Messages Dropdown */}
            {showMessages && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-brand-card-border rounded-brand-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-brand-card-border">
                  <h3 className="text-brand-text font-semibold">Messages</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border-b border-brand-card-border hover:bg-brand-hover cursor-pointer transition-all">
                      <p className="text-brand-text text-sm font-medium"></p>
                      <p className="text-brand-text-secondary text-xs mt-1">Loan approval pending...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-brand-card-border hover:bg-brand-hover transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                {userName.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-brand-text text-sm font-medium">{userName}</p>
                <p className="text-brand-text-secondary text-xs">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-brand-text-secondary" />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-brand-card-border rounded-brand-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-brand-card-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-brand-text font-medium text-sm">{userName}</p>
                      <p className="text-brand-text-secondary text-xs">{userRole}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text transition-all text-sm">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text transition-all text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Security</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-brand-danger hover:bg-brand-danger/10 transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
