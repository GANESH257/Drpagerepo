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
import {
  LayoutDashboard,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Users,
  MessageCircle,
  Crown,
} from 'lucide-react';

interface DashboardLayoutProps {
  doctor: Doctor;
  children: React.ReactNode;
  onProfileUpdate?: (doctor: Doctor) => void;
}

const doctorNavItems = [
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

  const headerRight = (
    <>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="text-right">
          <div className="font-semibold text-[#0F5FA8]">{currentDoctor.fullName}</div>
          {currentDoctor.verified && (
            <Badge variant="outline" className="mt-1 border-[#0F5FA8] text-[#0F5FA8] bg-white">
              Verified
            </Badge>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Log Out</span>
      </Button>
    </>
  );

  return (
    <DoctorProvider doctor={currentDoctor} onUpdate={handleProfileUpdate}>
      <PortalShell
        sidebarItems={doctorNavItems}
        headerTitle="Doctor Dashboard"
        headerRight={headerRight}
      >
        {children}
      </PortalShell>
    </DoctorProvider>
  );
}
