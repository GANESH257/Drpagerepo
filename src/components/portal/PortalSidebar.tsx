'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortalNavItem } from './portalNavTypes';

interface PortalSidebarProps {
  items: PortalNavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Optional footer (e.g. user avatar + logout) */
  sidebarFooter?: ReactNode;
}

function isActive(href: string, pathname: string, basePaths: string[]) {
  if (pathname === href) return true;
  const isBase = basePaths.some((p) => p === href);
  if (!isBase && pathname.startsWith(href + '/')) return true;
  return false;
}

function hasActiveChild(item: PortalNavItem, pathname: string, basePaths: string[]): boolean {
  if (!item.children?.length) return false;
  return item.children.some(
    (c) => pathname === c.href || (c.href && pathname.startsWith(c.href + '/'))
  );
}

export function PortalSidebar({ items, isCollapsed, onToggleCollapse, sidebarFooter }: PortalSidebarProps) {
  const pathname = usePathname();
  const basePaths = ['/admin', '/doctor/dashboard'];

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.children?.length && hasActiveChild(item, pathname, basePaths)) {
        set.add(item.label);
      }
    });
    return set;
  });

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      items.forEach((item) => {
        if (item.children?.length && hasActiveChild(item, pathname, basePaths)) {
          next.add(item.label);
        }
      });
      return next;
    });
  }, [pathname, items]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside
      className={cn(
        'portal-sidebar flex flex-col h-full flex-shrink-0 border-r transition-all duration-300 hidden lg:flex overflow-hidden',
        'border-[var(--sidebar-border)]',
        'bg-[var(--sidebar)] text-[var(--sidebar-foreground)]',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo — reference design */}
      <div className="flex-shrink-0 p-5 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
          >
            AIP
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--sidebar-foreground)] leading-tight truncate">
                Alliance of Independent
              </p>
              <p className="text-xs font-bold leading-tight truncate" style={{ color: 'var(--aip-teal)' }}>
                Physicians
              </p>
              <p className="text-[10px] font-medium opacity-70" style={{ color: 'var(--aip-gold)' }}>
                ST. LOUIS
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className={cn('flex-shrink-0 flex justify-end p-2', isCollapsed && 'justify-center')}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 rounded-lg text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)] hover:text-[var(--aip-teal)] transition-all"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Nav — scrollable; footer stays fixed at bottom */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-0.5 sidebar-nav-scroll">
        {items.map((item) => {
          const Icon = item.icon;
          const href = item.href ?? '#';
          const active = href !== '#' && isActive(href, pathname, basePaths);
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openGroups.has(item.label);
          const activeChild = hasChildren && hasActiveChild(item, pathname, basePaths);

          if (hasChildren && !isCollapsed) {
            return (
              <div key={item.label}>
                <div className="flex items-center gap-1 rounded-lg overflow-hidden">
                  {href && href !== '#' ? (
                    <Link
                      href={href}
                      className={cn(
                        'flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all min-w-0',
                        active
                          ? 'font-semibold bg-[var(--sidebar-accent)] text-[var(--aip-teal)]'
                          : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ) : (
                    <span className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--sidebar-foreground)]">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-lg text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)] hover:text-[var(--aip-teal)] transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aip-teal)]'
                    )}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {isOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-[var(--sidebar-border)] pl-3">
                    {item.children!.map((child) => {
                      const childHref = child.href ?? '#';
                      const childActive =
                        childHref !== '#' &&
                        (pathname === childHref || pathname.startsWith(childHref + '/'));
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={childHref + child.label}
                          href={childHref}
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all',
                            childActive
                              ? 'font-semibold text-[var(--aip-teal)]'
                              : 'text-[var(--sidebar-foreground)]/80 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]'
                          )}
                        >
                          <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (hasChildren && isCollapsed) {
            return (
              <Link
                key={item.label}
                href={href}
                title={item.label}
                className={cn(
                  'flex items-center justify-center rounded-lg p-2 text-sm transition-all',
                  active || activeChild
                    ? 'bg-[var(--sidebar-accent)] text-[var(--aip-teal)]'
                    : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]'
                )}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href ?? item.label}
              href={href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                active
                  ? 'font-semibold bg-[var(--sidebar-accent)] text-[var(--aip-teal)]'
                  : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer — optional; flex-shrink-0 so it never overlaps nav */}
      {sidebarFooter && (
        <div className="flex-shrink-0 p-3 border-t border-[var(--sidebar-border)]">
          {sidebarFooter}
        </div>
      )}
    </aside>
  );
}
