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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm border-t-2 border-t-[var(--aip-teal)]">
      <div className={cn(
        "mx-auto flex h-14 items-center justify-between px-3 md:px-6 w-full transition-all duration-300",
      )}>
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10 rounded-lg transition-colors"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-lg md:text-xl font-bold tracking-tight truncate text-foreground" style={{ color: 'var(--aip-teal)' }}>{title}</h1>
            <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-[var(--aip-teal)] leading-none ml-0.5 whitespace-nowrap">Admin</span>
          </div>
        </div>

        {/* Right: User info + Actions */}
        <div className="flex items-center gap-4">{rightContent}</div>
      </div>
    </header>
  );
}
