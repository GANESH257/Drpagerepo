'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortalHeaderProps {
  title: string;
  rightContent: React.ReactNode;
  onMenuClick: () => void;
}

export function PortalHeader({ title, rightContent, onMenuClick }: PortalHeaderProps) {
  return (
    <header className="sticky top-24 md:top-28 z-40 w-full border-b border-gray-200 bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#0F5FA8]">{title}</h1>
        </div>

        {/* Right: User info + Actions */}
        <div className="flex items-center gap-4">{rightContent}</div>
      </div>
    </header>
  );
}
