'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText,
  Crown,
  FileCheck,
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
    label: 'Membership Requests',
    href: '/admin/requests',
    icon: FileText,
    description: 'Review and manage join requests',
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
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Navigation</SheetTitle>
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
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-brand-teal/10 text-brand-teal border-l-2 border-brand-teal'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', isActive && 'text-brand-teal')} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
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
