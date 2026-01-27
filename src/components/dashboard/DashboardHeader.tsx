'use client';

import { useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { Doctor } from '@/types';

interface DashboardHeaderProps {
  doctor: Doctor;
  onMenuClick: () => void;
}

export function DashboardHeader({ doctor, onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const { clearSession } = useDoctorSession();

  const handleLogout = () => {
    clearSession();
    router.push('/join-us');
  };

  return (
    <header className="sticky top-20 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <h1 className="text-xl font-bold text-brand-dark-blue">Doctor Dashboard</h1>
        </div>

        {/* Right: Doctor info + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <div className="font-semibold text-brand-dark-blue">{doctor.fullName}</div>
              {doctor.verified && (
                <Badge variant="outline" className="mt-1 border-brand-teal text-brand-teal">
                  Verified
                </Badge>
              )}
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
