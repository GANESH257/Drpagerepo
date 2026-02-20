'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText,
  Crown,
  FileCheck,
  Calendar,
  Users,
  Building2,
  Send,
  Bell,
  LogOut
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { clearAdminSession } from '@/lib/adminSession';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
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
    label: 'Practice Management',
    href: '/admin/practices',
    icon: Building2,
    description: 'Manage practices and locations',
  },
  {
    label: 'Referrals',
    href: '/admin/referrals',
    icon: Send,
    description: 'View all referrals system-wide',
  },
  {
    label: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    description: 'View all notifications system-wide',
  },
];

interface AdminMobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminMobileSidebar({ open, onOpenChange }: AdminMobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAdminSession();
    onOpenChange(false);
    router.push('/admin/login');
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
              (item.href !== '/admin' && pathname.startsWith(item.href));

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
