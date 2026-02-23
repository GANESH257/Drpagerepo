'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortalNavItem } from './portalNavTypes';

interface PortalSidebarProps {
  items: PortalNavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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

export function PortalSidebar({ items, isCollapsed, onToggleCollapse }: PortalSidebarProps) {
  const pathname = usePathname();
  const basePaths = ['/admin', '/doctor/dashboard'];

  // Default-open groups that contain the current path
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
        'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-white transition-all duration-300 overflow-y-auto border-r border-gray-100 shadow-sm',
        isCollapsed ? 'w-20' : 'w-72',
        'hidden lg:block'
      )}
      data-scroll-exclude
    >
      <div className="flex h-full flex-col">
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 rounded-lg text-gray-500 hover:text-[#0F5FA8] hover:bg-gray-100 transition-all duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-4 pb-6">
          {items.map((item) => {
            const Icon = item.icon;
            const href = item.href ?? '#';
            const active = href !== '#' && isActive(href, pathname, basePaths);
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openGroups.has(item.label);
            const activeChild = hasChildren && hasActiveChild(item, pathname, basePaths);

            if (hasChildren && !isCollapsed) {
              return (
                <div key={item.label} className="space-y-0.5">
                  <div className="flex items-center gap-1 rounded-xl border border-transparent overflow-hidden">
                    {href && href !== '#' ? (
                      <Link
                        href={href}
                        className={cn(
                          'flex-1 flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 min-w-0',
                          active
                            ? 'bg-[#0F5FA8] text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F5FA8]'
                        )}
                      >
                        <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-gray-400')} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    ) : (
                      <span className="flex-1 flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600">
                        <Icon className="h-5 w-5 shrink-0 text-gray-400" />
                        <span className="truncate">{item.label}</span>
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-lg text-gray-500 hover:text-[#0F5FA8] hover:bg-gray-100"
                      onClick={() => toggleGroup(item.label)}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  {isOpen && (
                    <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-0.5">
                      {item.children!.map((child) => {
                        const childHref = child.href ?? '#';
                        const childActive = childHref !== '#' && (pathname === childHref || pathname.startsWith(childHref + '/'));
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={childHref + child.label}
                            href={childHref}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                              childActive
                                ? 'bg-[#0F5FA8]/10 text-[#0F5FA8] font-semibold'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F5FA8]'
                            )}
                          >
                            <ChildIcon className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="truncate">{child.label}</span>
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
                    'group flex items-center justify-center rounded-xl px-2 py-3 text-sm font-semibold transition-all duration-200 border border-transparent',
                    active || activeChild
                      ? 'bg-[#0F5FA8] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F5FA8]'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', (active || activeChild) ? 'text-white' : 'text-gray-400')} />
                </Link>
              );
            }

            return (
              <Link
                key={item.href ?? item.label}
                href={href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border border-transparent',
                  active
                    ? 'bg-[#0F5FA8] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#0F5FA8]'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    active ? 'text-white' : 'text-gray-400 group-hover:text-[#0F5FA8]'
                  )}
                />
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate leading-none">{item.label}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
