'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PortalHeaderProps {
  title: string;
  rightContent: React.ReactNode;
  onMenuClick: () => void;
  isCollapsed?: boolean;
}

export function PortalHeader({ title, rightContent, onMenuClick, isCollapsed }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-[var(--dashboard-main-bg)]/95 backdrop-blur-md shadow-sm border-t-2 border-t-[var(--aip-teal)]">
      <div className={cn(
        "mx-auto flex h-16 items-center justify-between px-3 md:px-6 w-full transition-all duration-300",
      )}>
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-500 hover:text-brand-dark-blue hover:bg-brand-dark-blue/5 rounded-xl transition-colors"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-brand-dark-blue truncate">{title}</h1>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-teal leading-none ml-0.5 whitespace-nowrap">Physician Governance</span>
          </div>
        </div>

        {/* Right: User info + Actions */}
        <div className="flex items-center gap-4">{rightContent}</div>
      </div>
    </header>
  );
}
