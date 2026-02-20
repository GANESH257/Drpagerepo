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
        'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-white transition-all duration-300 overflow-y-auto border-r border-gray-100 shadow-sm',
        isCollapsed ? 'w-20' : 'w-72',
        'hidden lg:block'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse toggle button */}
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 rounded-xl text-gray-400 hover:text-brand-dark-blue hover:bg-brand-dark-blue/5 transition-all duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 pb-6">
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
                  'group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 border border-transparent',
                  isActive
                    ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20 border-brand-teal/10 scale-[1.02]'
                    : 'text-gray-500 hover:bg-brand-teal/5 hover:text-brand-teal hover:border-brand-teal/5'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-300',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-teal group-hover:scale-110'
                  )}
                />
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate leading-none">{item.label}</div>
                    {/* Hiding description for a cleaner modern look in the sidebar */}
                  </div>
                )}
                {isActive && !isCollapsed && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
