'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PortalSidebar } from './PortalSidebar';
import { PortalHeader } from './PortalHeader';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface PortalShellProps {
  children: ReactNode;
  sidebarItems: NavItem[];
  headerTitle: string;
  headerRight: ReactNode;
  mobileSidebarTitle?: string;
}

export function PortalShell({
  children,
  sidebarItems,
  headerTitle,
  headerRight,
  mobileSidebarTitle = 'Navigation',
}: PortalShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PortalHeader
        title={headerTitle}
        rightContent={headerRight}
        onMenuClick={() => setMobileSidebarOpen(true)}
      />
      <PortalSidebar
        items={sidebarItems}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col bg-white">
          <SheetHeader className="border-b border-gray-200 p-4">
            <SheetTitle className="text-[#0F5FA8]">{mobileSidebarTitle}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4 flex-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' &&
                  item.href !== '/doctor/dashboard' &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    'hover:bg-gray-100',
                    isActive
                      ? 'bg-[#0F5FA8]/10 text-[#0F5FA8] border-l-[3px] border-[#0F5FA8]'
                      : 'text-gray-600'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', isActive && 'text-[#0F5FA8]')} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <main
        className={`
          transition-all duration-300 flex-1 bg-white
          lg:ml-64
          ${sidebarCollapsed ? 'lg:ml-16' : ''}
          pt-24 md:pt-28
        `}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
