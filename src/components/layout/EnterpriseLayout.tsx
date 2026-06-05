'use client';

import React, { useState } from 'react';
import EnterpriseSidebar from './EnterpriseSidebar';
import EnterpriseTopbar from './EnterpriseTopbar';
import MobileBottomNav from './MobileBottomNav';
import { UserRole } from '@/lib/role-menus';
import { Menu } from 'lucide-react';

interface EnterpriseLayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  userName?: string;
  userAvatar?: string;
}

export default function EnterpriseLayout({ 
  children, 
  currentRole, 
  userName = 'User',
  userAvatar 
}: EnterpriseLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-primary">
      <EnterpriseSidebar 
        currentRole={currentRole} 
        userName={userName}
        userAvatar={userAvatar}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <EnterpriseTopbar 
        userName={userName}
        userRole={currentRole.replace('_', ' ')}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      
      {/* Hamburger Button (Mobile/Tablet) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-brand-card-bg border border-brand-card-border backdrop-blur-glass text-white hover:bg-brand-hover transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Main Content Area */}
      <main className="pt-16 md:pl-[280px] pb-16 md:pb-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}
