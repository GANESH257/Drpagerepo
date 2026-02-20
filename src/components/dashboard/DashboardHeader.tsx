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
    <header className="sticky top-24 md:top-28 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-brand-teal/10 text-brand-dark-blue"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-brand-dark-blue">Physician Portal</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal leading-none">Management Console</span>
          </div>
        </div>

        {/* Right: Doctor info + Logout */}
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex flex-col items-end">
              <div className="text-sm font-bold text-brand-dark-blue leading-tight">{doctor.fullName}</div>
              {doctor.verified && (
                <div className="flex items-center mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-teal mr-1.5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">Verified Physician</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-9 px-4 rounded-xl border-gray-200 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
