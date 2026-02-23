'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Doctor } from '@/types';
import { PortalShell } from '@/components/portal/PortalShell';
import { DoctorProvider } from './DoctorContext';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageBell } from './MessageBell';
import { AnnouncementBell } from './AnnouncementBell';
import { NotificationBell } from './NotificationBell';
import type { PortalNavItem } from '@/components/portal/portalNavTypes';

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
  Cog,
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
      { label: 'My Contacts', href: `${baseUrl}/find-physician/contacts`, icon: BookUser, description: 'Your saved contacts for referrals and messages' },
    ],
  },
  {
    label: 'My Practice',
    href: `${baseUrl}/my-practice`,
    icon: Building,
    description: 'View your practice profile',
    children: [
      { label: 'View Practice Profile', href: `${baseUrl}/my-practice`, icon: Building, description: 'Read-only practice profile' },
      { label: 'View Practice Locations', href: `${baseUrl}/my-practice/locations`, icon: MapPin, description: 'Read-only list of office locations' },
    ],
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
  { label: 'Account Settings', href: `${baseUrl}/settings`, icon: Cog, description: 'Login and notification preferences' },
];

// Practice Admin only (9–10) — hierarchical
const practiceAdminNavTree: PortalNavItem[] = [
  {
    label: 'Practice Management',
    href: `${baseUrl}/practice`,
    icon: Building,
    description: 'Edit and manage your practice',
    children: [
      { label: 'Manage Doctors', href: `${baseUrl}/practice/doctors`, icon: Users, description: 'Invite, approve, view doctors in your practice' },
      { label: 'Edit Practice Profile', href: `${baseUrl}/practice/profile`, icon: Building, description: 'Edit shared practice details' },
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
  const navTree = isPracticeAdmin ? [...baseDoctorNavTree, ...practiceAdminNavTree] : baseDoctorNavTree;

  const headerRight = (
    <>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="text-right">
          <div className="font-bold text-brand-dark-blue leading-tight">{currentDoctor.fullName}</div>
          {currentDoctor.verified && (
            <div className="flex items-center mt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-teal mr-1.5 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">Verified Physician</span>
            </div>
          )}
          {isPracticeAdmin && (
            <Badge variant="default" className="mt-1 bg-blue-600 text-white">
              Practice Admin
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2 mr-2 md:mr-4">
        <MessageBell userId={currentDoctor.id} />
        <AnnouncementBell doctorId={currentDoctor.id} practiceId={currentDoctor.practiceId} />
        <NotificationBell doctorId={currentDoctor.id} />
      </div>
      <Button
        variant="outline"
        size="lg"
        onClick={handleLogout}
        className="h-10 px-3 md:px-5 rounded-2xl border-gray-200 text-gray-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300 group"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline">Sign Out</span>
      </Button>
    </>
  );

  return (
    <DoctorProvider doctor={currentDoctor} onUpdate={handleProfileUpdate}>
      <PortalShell
        sidebarItems={navTree}
        headerTitle="Doctor Dashboard"
        headerRight={headerRight}
      >
        {children}
      </PortalShell>
    </DoctorProvider>
  );
}
