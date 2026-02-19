'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalShell } from '@/components/portal/PortalShell';
import { clearAdminSession, getAdminSession } from '@/lib/adminSession';
import {
  LayoutDashboard,
  FileText,
  Crown,
  FileCheck,
  Calendar,
  Users,
  Megaphone,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and statistics',
  },
  {
    label: 'Approval Requests',
    href: '/admin/requests-v2',
    icon: FileText,
    description: 'Review and manage all approval requests',
  },
  {
    label: 'Membership Plans',
    href: '/admin/memberships',
    icon: Crown,
    description: 'Edit membership plans and pricing',
  },
  {
    label: 'Policies',
    href: '/admin/policies',
    icon: FileCheck,
    description: 'Manage organization policies',
  },
  {
    label: 'Events',
    href: '/admin/events',
    icon: Calendar,
    description: 'Edit meetings and events',
  },
  {
    label: 'Member Management',
    href: '/admin/members',
    icon: Users,
    description: 'Manage doctor members',
  },
  {
    label: 'Announcements',
    href: '/admin/announcements',
    icon: Megaphone,
    description: 'Broadcast and manage announcements',
  },
];

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const session = getAdminSession();

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  const headerRight = (
    <>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="text-right">
          <div className="font-semibold text-[#0F5FA8]">{session?.email || 'admin@aip.com'}</div>
          <Badge variant="outline" className="mt-1 border-[#0F5FA8] text-[#0F5FA8] bg-white">
            Admin
          </Badge>
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
    <PortalShell
      sidebarItems={adminNavItems}
      headerTitle="Admin Portal"
      headerRight={headerRight}
    >
      {children}
    </PortalShell>
  );
}
