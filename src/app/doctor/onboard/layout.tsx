'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { PortalShell } from '@/components/portal/PortalShell';
import { PortalThemeToggle } from '@/components/portal/PortalThemeToggle';
import { usePortalTheme } from '@/contexts/PortalThemeContext';
import { cn } from '@/lib/utils';
import type { PortalNavItem } from '@/components/portal/portalNavTypes';
import { LayoutDashboard, User, Building, Settings } from 'lucide-react';

const baseUrl = '/doctor/onboard';

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { getToken, getUser, isAuthenticated, clearSession } = useDoctorSession();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) {
      router.push('/join-us');
      return;
    }
    const user = getUser();
    const token = getToken();
    if (!token || !user || user.role !== 'doctor' || !user.doctorId) {
      router.push('/join-us');
      return;
    }
  }, [mounted, isAuthenticated, getUser, getToken, router]);

  const { theme } = usePortalTheme();
  const darkClass = theme === 'dark' ? 'dark' : '';

  const user = getUser();
  const isPA = user?.roleInPractice === 'practice_admin';

  const navItems: PortalNavItem[] = [
    { label: 'Dashboard', href: baseUrl, icon: LayoutDashboard, description: 'Complete your profile steps' },
    { label: 'Edit Profile', href: `${baseUrl}/profile`, icon: User, description: 'Profile, insurance & services' },
    ...(isPA ? [{ label: 'Edit Practice', href: `${baseUrl}/practice`, icon: Building, description: 'Practice details & locations' } as PortalNavItem] : []),
  ];

  const displayName = user?.email ? user.email.split('@')[0] : 'Doctor';
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    clearSession();
    router.push('/join-us');
  };

  const headerRight = (
    <div className="flex items-center gap-2">
      <PortalThemeToggle />
      <div className="relative">
        <button
          type="button"
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-accent focus:outline-none focus:ring-2 focus:ring-[var(--aip-teal)]/20"
          aria-expanded={userMenuOpen}
          aria-label="User menu"
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)' }}
          >
            {initials}
          </div>
          <span className="hidden sm:inline text-sm font-semibold truncate max-w-[120px]">{displayName}</span>
          <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-muted-foreground', userMenuOpen && 'rotate-180')} />
        </button>
        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" aria-hidden onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg" role="menu">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const sidebarFooter = (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[var(--sidebar-foreground)] truncate">{displayName}</p>
        <p className="text-[10px] truncate" style={{ color: 'var(--aip-teal)' }}>Complete your profile</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="text-[var(--sidebar-foreground)]/70 hover:text-red-400 transition-colors p-1 rounded"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );

  if (!mounted || !user?.doctorId) {
    return (
      <div className={cn(darkClass, 'min-h-screen bg-background flex items-center justify-center')}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--aip-teal)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={cn(darkClass, 'min-h-screen')}>
      <PortalShell
        sidebarItems={navItems}
        headerTitle="Complete Your Profile"
        headerRight={headerRight}
        sidebarFooter={sidebarFooter}
        mainClassName="doctor-portal-main"
      >
        {children}
      </PortalShell>
    </div>
  );
}
