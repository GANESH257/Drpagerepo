'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ChevronDown, Cog } from 'lucide-react';
import { Doctor } from '@/types';
import { PortalShell } from '@/components/portal/PortalShell';
import { DoctorProvider } from './DoctorContext';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageBell } from './MessageBell';
import { AnnouncementBell } from './AnnouncementBell';
import { NotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';
import type { PortalNavItem } from '@/components/portal/portalNavTypes';
import { PortalThemeToggle } from '@/components/portal/PortalThemeToggle';

interface DashboardLayoutProps {
  doctor: Doctor;
  children: React.ReactNode;
  onProfileUpdate?: (doctor: Doctor) => void;
}

import {
  LayoutDashboard,
  User,
  MapPin,
  CreditCard,
  Users,
  MessageCircle,
  Crown,
  Megaphone,
  Building,
  FileCheck,
  Settings,
  History,
  MessageSquare,
  Search,
  BookUser,
  ClipboardList,
} from 'lucide-react';

const baseUrl = '/doctor/dashboard';

// Core nav (1–8) — hierarchical per reference: ↳ = children
const baseDoctorNavTree: PortalNavItem[] = [
  { label: 'Dashboard', href: baseUrl, icon: LayoutDashboard, description: 'Your personal landing page with profile status and quick links' },
  {
    label: 'Find a Physician',
    href: `${baseUrl}/find-physician`,
    icon: Search,
    description: 'Search for any physician in the AIP network',
    children: [
      { label: 'Find a Physician', href: `${baseUrl}/find-physician`, icon: Search, description: 'Search the AIP network' },
      { label: 'My Contacts', href: `${baseUrl}/find-physician/contacts`, icon: BookUser, description: 'Your saved contacts for referrals and messages' },
    ],
  },
  {
    label: 'My Practice',
    href: `${baseUrl}/my-practice`,
    icon: Building,
    description: 'View your practice profile, contact info, locations, and physicians',
  },
  {
    label: 'My Profile',
    href: `${baseUrl}/profile`,
    icon: User,
    description: 'Manage your professional information',
    children: [
      { label: 'Edit Profile', href: `${baseUrl}/profile`, icon: User, description: 'Update details, credentials, bio, awards' },
      { label: 'Services & Insurance', href: `${baseUrl}/insurance`, icon: CreditCard, description: 'Conditions treated, procedures, accepted insurance' },
      { label: 'View Public Profile', href: `${baseUrl}/profile/public`, icon: User, description: 'Preview as seen by the public' },
    ],
  },
  { label: 'Referrals', href: `${baseUrl}/referrals`, icon: Users, description: 'Incoming and outgoing referrals; create with My Contacts' },
  {
    label: 'Community & News',
    href: `${baseUrl}/community`,
    icon: MessageSquare,
    description: 'Network information and engagement',
    children: [
      { label: 'Leadership & Committees', href: `${baseUrl}/community/leadership`, icon: ClipboardList, description: 'Board of Directors and committees' },
      { label: 'Community Forum', href: `${baseUrl}/community`, icon: MessageSquare, description: 'Q&A discussion board' },
      { label: 'Announcements & Events', href: `${baseUrl}/community/announcements`, icon: Megaphone, description: 'Official news and event calendar' },
    ],
  },
  { label: 'Messages', href: `${baseUrl}/messages`, icon: MessageCircle, description: 'Secure direct messaging' },
  { label: 'Membership', href: `${baseUrl}/membership`, icon: Crown, description: 'Your membership details and renewals' },
];

// Always last in sidebar
const accountSettingsNavItem: PortalNavItem = { label: 'Account Settings', href: `${baseUrl}/settings`, icon: Cog, description: 'Login and notification preferences' };

// Practice Admin only (9–10) — hierarchical
const practiceAdminNavTree: PortalNavItem[] = [
  {
    label: 'Practice Management',
    href: `${baseUrl}/practice`,
    icon: Building,
    description: 'Edit and manage your practice',
    children: [
      { label: 'Practice Approvals', href: `${baseUrl}/practice/approvals`, icon: FileCheck, description: 'Approve doctor join requests and other practice changes' },
      { label: 'Manage Doctors', href: `${baseUrl}/practice/doctors`, icon: Users, description: 'Invite, approve, view doctors in your practice' },
      { label: 'Edit Practice Profile', href: `${baseUrl}/practice`, icon: Building, description: 'Edit practice details (Request Edit on the practice page)' },
      { label: 'Manage Practice Locations', href: `${baseUrl}/practice/locations`, icon: MapPin, description: 'Add, edit, or remove office locations' },
    ],
  },
  { label: 'Membership & Billing', href: `${baseUrl}/practice/membership`, icon: Crown, description: 'Practice subscription, seats, and billing history' },
];

export function DashboardLayout({ doctor, children, onProfileUpdate }: DashboardLayoutProps) {
  const router = useRouter();
  const { clearSession } = useDoctorSession();
  const [currentDoctor, setCurrentDoctor] = useState(doctor);

  useEffect(() => {
    setCurrentDoctor(doctor);
  }, [doctor]);

  const handleProfileUpdate = useCallback((updatedDoctor: Doctor) => {
    setCurrentDoctor(updatedDoctor);
    onProfileUpdate?.(updatedDoctor);
  }, [onProfileUpdate]);

  const handleLogout = () => {
    clearSession();
    router.push('/join-us');
  };

  const isPracticeAdmin = currentDoctor.roleInPractice === 'practice_admin';
  const navTree = isPracticeAdmin
    ? [...baseDoctorNavTree, ...practiceAdminNavTree, accountSettingsNavItem]
    : [...baseDoctorNavTree, accountSettingsNavItem];

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const initials = currentDoctor.fullName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const headerRight = (
    <>
      <div className="flex items-center gap-1 md:gap-2">
        <PortalThemeToggle />
        <MessageBell userId={currentDoctor.id} />
        <AnnouncementBell doctorId={currentDoctor.id} practiceId={currentDoctor.practiceId} />
        <NotificationBell doctorId={currentDoctor.id} />
      </div>
      <div className="relative" ref={userMenuRef}>
        <button
          type="button"
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-[var(--aip-teal)]/20 focus:ring-offset-2"
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
          aria-label="User menu"
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)' }}
          >
            {initials}
          </div>
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-sm font-semibold text-foreground">{currentDoctor.fullName}</span>
            {currentDoctor.verified && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--aip-teal)]">
                <span className="h-1 w-1 rounded-full bg-[var(--aip-teal)]" /> Verified
              </span>
            )}
            {isPracticeAdmin && (
              <Badge variant="secondary" className="mt-0.5 w-fit text-[10px] bg-accent text-accent-foreground">
                Practice Admin
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn('h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')}
          />
        </button>
        {userMenuOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg"
            role="menu"
          >
            <Link
              href={`${baseUrl}/settings`}
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
              role="menuitem"
            >
              <Cog className="h-4 w-4 text-muted-foreground" />
              Account Settings
            </Link>
          </div>
        )}
      </div>
    </>
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
        <p className="text-xs font-bold text-[var(--sidebar-foreground)] truncate">{currentDoctor.fullName}</p>
        <p className="text-xs truncate" style={{ color: 'var(--aip-teal)' }}>{currentDoctor.specialty}</p>
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

  return (
    <DoctorProvider doctor={currentDoctor} onUpdate={handleProfileUpdate}>
      <PortalShell
        sidebarItems={navTree}
        headerTitle="Doctor Dashboard"
        headerRight={headerRight}
        sidebarFooter={sidebarFooter}
        mainClassName="doctor-portal-main"
      >
        {children}
      </PortalShell>
    </DoctorProvider>
  );
}
