'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Users,
  Crown,
  Bell,
  Megaphone,
  Building,
  X,
  LogOut
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
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
    label: 'Notifications',
    href: '/doctor/dashboard/notifications',
    icon: Bell,
    description: 'View notifications and updates',
  },
  {
    label: 'Announcements',
    href: '/doctor/dashboard/announcements',
    icon: Megaphone,
    description: 'View announcements',
  },
  {
    label: 'Membership',
    href: '/doctor/dashboard/membership',
    icon: Crown,
    description: 'Manage membership details, renewals, and upgrades',
  },
];

interface DashboardMobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardMobileSidebar({ open, onOpenChange }: DashboardMobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearSession } = useDoctorSession();

  const handleLogout = () => {
    clearSession();
    onOpenChange(false);
    router.push('/join-us');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 flex flex-col bg-white">
        <SheetHeader className="border-b border-gray-200 p-4">
          <SheetTitle className="text-[#0F5FA8]">Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/doctor/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  'hover:bg-gray-100',
                  isActive
                    ? 'bg-[#0F5FA8]/10 text-[#0F5FA8] border-l-[3px] border-[#0F5FA8]'
                    : 'text-gray-600'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', isActive && 'text-[#0F5FA8]')} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            aria-label="Log out"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
