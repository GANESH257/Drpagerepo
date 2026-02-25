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
  /** Optional footer block for sidebar (e.g. user avatar + logout) */
  sidebarFooter?: ReactNode;
  /** Optional class for main content area (e.g. doctor-portal-main for grey bg) */
  mainClassName?: string;
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
  sidebarFooter,
  mainClassName,
}: PortalShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const basePaths = ['/admin', '/doctor/dashboard', '/doctor/onboard'];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <PortalSidebar
        items={sidebarItems}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarFooter={sidebarFooter}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <PortalHeader
          title={headerTitle}
          rightContent={headerRight}
          onMenuClick={() => setMobileSidebarOpen(true)}
          isCollapsed={sidebarCollapsed}
        />
        <main className={cn('flex-1 overflow-y-auto overflow-x-hidden bg-background page-glow relative px-6 py-6', mainClassName)}>
          <div className="mx-auto w-full max-w-7xl space-y-6 relative z-10">
            {children}
          </div>
        </main>
      </div>
      {/* Mobile Sidebar — same tree with groups and children */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col bg-background border-border">
          <SheetHeader className="border-b border-border p-6 pt-10">
            <SheetTitle className="text-2xl font-bold tracking-tight text-foreground" style={{ color: 'var(--aip-teal)' }}>
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
                            ? 'bg-[var(--aip-teal)] text-white'
                            : 'text-muted-foreground hover:bg-accent hover:text-[var(--aip-teal)]'
                        )}
                      >
                        <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-muted-foreground')} />
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
                              ? 'bg-[var(--aip-teal)] text-white'
                              : 'text-muted-foreground hover:bg-accent hover:text-[var(--aip-teal)]'
                          )}
                        >
                          <ChildIcon className={cn('h-4 w-4 shrink-0', childActive ? 'text-white' : 'text-muted-foreground')} />
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
                      ? 'bg-[var(--aip-teal)] text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-[var(--aip-teal)]'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-muted-foreground')} />
                  <div className="flex flex-col">
                    <span className="leading-none">{item.label}</span>
                    {!active && item.description && (
                      <span className="text-[10px] font-medium text-muted-foreground mt-1 line-clamp-1">
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
    </div>
  );
}

