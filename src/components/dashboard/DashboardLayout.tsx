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
  Calendar,
  Users,
  MessageCircle,
  Crown,
  Megaphone,
  Building,
  FileCheck,
  Settings,
  History,
} from 'lucide-react';

// Base nav items for all doctors
const baseDoctorNavItems = [
  {
    label: 'Overview',
    href: '/doctor/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard overview and quick actions',
  },
  {
    label: 'Edit Profile',
    href: '/doctor/dashboard/profile',
    icon: User,
    description: 'Update your professional information and credentials',
  },
  {
    label: 'View Practice',
    href: '/doctor/dashboard/practice-info',
    icon: Building,
    description: 'View your practice information',
  },
  {
    label: 'Manage Locations',
    href: '/doctor/dashboard/locations',
    icon: MapPin,
    description: 'Add or update your practice locations',
  },
  {
    label: 'Insurance & Services',
    href: '/doctor/dashboard/insurance',
    icon: CreditCard,
    description: 'View and manage accepted insurance plans and services offered',
  },
  {
    label: 'Appointment Requests',
    href: '/doctor/dashboard/appointments',
    icon: Calendar,
    description: 'View and manage patient appointment requests',
  },
  {
    label: 'Referrals',
    href: '/doctor/dashboard/referrals',
    icon: Users,
    description: 'Track referrals from other physicians in the network',
  },
  {
    label: 'Announcements',
    href: '/doctor/dashboard/announcements',
    icon: Megaphone,
    description: 'View announcements',
  },
  {
    label: 'Messages',
    href: '/doctor/dashboard/messages',
    icon: MessageCircle,
    description: 'Message other physicians in the network',
  },
  {
    label: 'Membership',
    href: '/doctor/dashboard/membership',
    icon: Crown,
    description: 'Manage membership details, renewals, and upgrades',
  },
];

// Practice admin nav items (additional)
const practiceAdminNavItems = [
  {
    label: 'Practice',
    href: '/doctor/dashboard/practice',
    icon: Building,
    description: 'Manage practice details',
  },
  {
    label: 'Practice Approvals',
    href: '/doctor/dashboard/practice/approvals',
    icon: FileCheck,
    description: 'Review and approve practice requests',
  },
  {
    label: 'Practice Doctors',
    href: '/doctor/dashboard/practice/doctors',
    icon: Users,
    description: 'Manage practice roster',
  },
  {
    label: 'Practice Locations',
    href: '/doctor/dashboard/practice/locations',
    icon: MapPin,
    description: 'View practice locations',
  },
  {
    label: 'Services & Insurance',
    href: '/doctor/dashboard/practice/services-insurance',
    icon: Settings,
    description: 'Manage services and insurance',
  },
  {
    label: 'Practice Membership',
    href: '/doctor/dashboard/practice/membership',
    icon: Crown,
    description: 'View practice membership overview',
  },
  {
    label: 'Practice History',
    href: '/doctor/dashboard/practice/history',
    icon: History,
    description: 'View approval history for your practice',
  },
];

export function DashboardLayout({ doctor, children, onProfileUpdate }: DashboardLayoutProps) {
  const router = useRouter();
  const { clearSession } = useDoctorSession();
  const [currentDoctor, setCurrentDoctor] = useState(doctor);

  // Sync doctor prop with state when it changes
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

  // Determine nav items based on role
  const isPracticeAdmin = currentDoctor.roleInPractice === 'practice_admin';
  const navItems = isPracticeAdmin
    ? [...baseDoctorNavItems, ...practiceAdminNavItems]
    : baseDoctorNavItems;

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
        sidebarItems={navItems}
        headerTitle="Doctor Dashboard"
        headerRight={headerRight}
      >
        {children}
      </PortalShell>
    </DoctorProvider>
  );
}
