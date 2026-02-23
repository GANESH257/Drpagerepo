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
import type { PortalNavItem } from './portalNavTypes';

interface PortalShellProps {
  children: ReactNode;
  sidebarItems: PortalNavItem[];
  headerTitle: string;
  headerRight: ReactNode;
  mobileSidebarTitle?: string;
}

function isActive(href: string | undefined, pathname: string, basePaths: string[]) {
  if (!href || href === '#') return false;
  if (pathname === href) return true;
  const isBase = basePaths.some((p) => p === href);
  if (!isBase && pathname.startsWith(href + '/')) return true;
  return false;
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
  const basePaths = ['/admin', '/doctor/dashboard'];

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
      {/* Mobile Sidebar — same tree with groups and children */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col bg-white">
          <SheetHeader className="border-b border-gray-200 p-6 pt-10">
            <SheetTitle className="text-2xl font-bold tracking-tight text-[#0F5FA8]">
              {mobileSidebarTitle}
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 space-y-1 p-6 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const href = item.href ?? '#';
              const active = href !== '#' && isActive(href, pathname, basePaths);
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.label} className="space-y-0.5">
                    {href !== '#' && (
                      <Link
                        href={href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all border border-transparent',
                          active
                            ? 'bg-[#0F5FA8] text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F5FA8]'
                        )}
                      >
                        <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-gray-400')} />
                        <span>{item.label}</span>
                      </Link>
                    )}
                    {item.children!.map((child) => {
                      const childHref = child.href ?? '#';
                      const childActive = childHref !== '#' && (pathname === childHref || pathname.startsWith(childHref + '/'));
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={childHref + child.label}
                          href={childHref}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-4 py-2.5 pl-8 text-sm font-medium transition-all border border-transparent',
                            childActive
                              ? 'bg-[#0F5FA8] text-white'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F5FA8]'
                          )}
                        >
                          <ChildIcon className={cn('h-4 w-4 shrink-0', childActive ? 'text-white' : 'text-gray-400')} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href ?? item.label}
                  href={href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border border-transparent',
                    active
                      ? 'bg-[#0F5FA8] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F5FA8]'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-gray-400')} />
                  <div className="flex flex-col">
                    <span className="leading-none">{item.label}</span>
                    {!active && item.description && (
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
          'transition-all duration-300 flex-1 bg-white pt-16 overflow-x-hidden',
          'lg:ml-72',
          sidebarCollapsed && 'lg:ml-20'
        )}
      >
        <div className="mx-auto px-4 py-6 md:py-8 w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
