'use client';

import { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileSidebar } from './AdminMobileSidebar';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen skin-benefits-enhanced flex flex-col">
      <AdminHeader 
        onMenuClick={() => setMobileSidebarOpen(true)} 
      />
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <AdminMobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />
      <main
        className={`
          transition-all duration-300 flex-1
          lg:ml-64
          ${sidebarCollapsed ? 'lg:ml-16' : ''}
          pt-32 md:pt-36
        `}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </div>
      </main>
      <DashboardFooter sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
