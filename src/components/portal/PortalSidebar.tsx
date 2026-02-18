'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface PortalSidebarProps {
  items: NavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function PortalSidebar({ items, isCollapsed, onToggleCollapse }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-24 md:top-28 z-30 h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] border-r border-gray-200 bg-white transition-all duration-300 overflow-y-auto',
        isCollapsed ? 'w-16' : 'w-64',
        'hidden lg:block'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse toggle button */}
        <div className="flex justify-end border-b border-gray-200 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
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
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0F5FA8]/10 text-[#0F5FA8] border-l-[3px] border-[#0F5FA8]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-[#0F5FA8]' : 'text-gray-500'
                  )}
                />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
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
