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
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm">
      <div className={cn(
        "mx-auto flex h-16 items-center justify-between px-3 md:px-6 w-full max-w-7xl transition-all duration-300",
        "lg:pl-72",
        isCollapsed && "lg:pl-20"
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
