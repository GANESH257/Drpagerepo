'use client';

import { useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clearAdminSession, getAdminSession } from '@/lib/adminSession';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const session = getAdminSession();

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-24 md:top-28 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground" style={{ color: 'var(--aip-teal)' }}>Admin Portal</h1>
        </div>

        {/* Right: Admin info + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <div className="font-semibold text-foreground" style={{ color: 'var(--aip-teal)' }}>{session?.email || 'admin@aip.com'}</div>
              <Badge variant="outline" className="mt-1 border-[var(--aip-teal)] text-[var(--aip-teal)]">
                Admin
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-destructive text-destructive hover:bg-destructive hover:text-white"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
