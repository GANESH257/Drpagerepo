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
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/doctor/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-brand-teal/15 text-brand-teal border-l-4 border-brand-teal shadow-sm'
                    : 'text-muted-foreground hover:bg-brand-teal/5',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-brand-teal')} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
