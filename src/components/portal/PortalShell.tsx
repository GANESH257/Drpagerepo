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
        isCollapsed={sidebarCollapsed}
      />
      <PortalSidebar
        items={sidebarItems}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col bg-white">
          <SheetHeader className="border-b border-gray-100 p-6 pt-10">
            <SheetTitle className="text-2xl font-extrabold tracking-tight text-brand-dark-blue">
              Dash<span className="text-brand-teal">board</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 space-y-2 p-6 overflow-y-auto">
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
                    'flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all duration-300 border border-transparent',
                    isActive
                      ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20 border-brand-teal/10'
                      : 'text-gray-500 hover:bg-brand-teal/5 hover:text-brand-teal'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0 transition-transform duration-300', isActive ? 'text-white' : 'text-gray-400')} />
                  <div className="flex flex-col">
                    <span className="leading-none">{item.label}</span>
                    {!isActive && (
                      <span className="text-[10px] font-medium text-gray-400 mt-1 line-clamp-1">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <main
        className={cn(
          "transition-all duration-300 flex-1 bg-white pt-16 overflow-x-hidden",
          "lg:ml-72",
          sidebarCollapsed && "lg:ml-20"
        )}
      >
        <div className="mx-auto px-4 py-6 md:py-8 w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
