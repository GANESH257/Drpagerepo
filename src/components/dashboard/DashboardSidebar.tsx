'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Users,
  Crown,
  Megaphone,
  Building,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({ isCollapsed, onToggleCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-40 md:top-44 z-30 h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)] border-r-2 border-brand-teal/20 bg-white transition-all duration-300 overflow-y-auto',
        'bg-gradient-to-b from-white to-var(--skin-vibrant-teal)/30',
        isCollapsed ? 'w-16' : 'w-64',
        'hidden lg:block'
      )}
      style={{
        background: 'linear-gradient(to bottom, white 0%, var(--skin-vibrant-teal) 100%)',
      }}
    >
      <div className="flex h-full flex-col">
        {/* Collapse toggle button */}
        <div className="flex justify-end border-b p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/doctor/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 mb-2 border border-transparent',
                  isActive
                    ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20 border-brand-teal/20 scale-[1.02]'
                    : 'text-gray-600 hover:bg-brand-teal/10 hover:text-brand-teal hover:border-brand-teal/10'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isCollapsed ? 'mx-auto' : 'mr-3',
                    isActive ? 'text-white scale-110' : 'text-gray-400 group-hover:text-brand-teal group-hover:scale-110'
                  )}
                />
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="leading-none">{item.label}</span>
                    {/* Optional: item.description if you want it small, but for sidebar usually just label is cleaner */}
                  </div>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
