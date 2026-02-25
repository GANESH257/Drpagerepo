'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalShell } from '@/components/portal/PortalShell';
import { clearAdminSession, getAdminSession } from '@/lib/adminSession';
import type { PortalNavItem } from '@/components/portal/portalNavTypes';
import {
  LayoutDashboard,
  FileText,
  Crown,
  Users,
  Megaphone,
  Building2,
  MessageCircle,
  MessageSquare,
  BarChart3,
  Shield,
  ListChecks,
  UserX,
  FileCode2,
  ClipboardList,
  Stethoscope,
  Settings,
} from 'lucide-react';
import { MessageBell } from '@/components/dashboard/MessageBell';
import { PortalThemeToggle } from '@/components/portal/PortalThemeToggle';

interface AdminShellProps {
  children: React.ReactNode;
}

const base = '/admin';

/** Super Admin nav tree per plan: sections with ↳ children (Member Management, Content, Platform Config, Community Moderation). */
const adminNavTree: PortalNavItem[] = [
  { label: 'Dashboard', href: base, icon: LayoutDashboard, description: 'Key metrics, pending approvals, quick links' },
  { label: 'Membership Approvals', href: `${base}/approvals`, icon: FileText, description: 'Practice and doctor approval queue' },
  {
    label: 'Member Management',
    icon: Building2,
    description: 'Practices and doctors',
    children: [
      { label: 'Manage Practices', href: `${base}/members/practices`, icon: Building2, description: 'Edit practices, view doctors, membership status' },
      { label: 'Manage Doctors', href: `${base}/members/doctors`, icon: Users, description: 'Edit profiles, reset password, active/inactive' },
    ],
  },
  {
    label: 'Content Management',
    icon: Megaphone,
    description: 'Announcements, policies, leadership',
    children: [
      { label: 'Announcements & Events', href: `${base}/content/announcements`, icon: Megaphone, description: 'Create and publish news and events' },
      { label: 'Policy Documents', href: `${base}/content/policies`, icon: FileCode2, description: 'Bylaws and key documents' },
      { label: 'Leadership & Committees', href: `${base}/content/leadership`, icon: ClipboardList, description: 'Public leadership directory' },
    ],
  },
  {
    label: 'Platform Configuration',
    icon: Settings,
    description: 'Plans, medical data, settings',
    children: [
      { label: 'Membership Plans', href: `${base}/config/plans`, icon: Crown, description: 'Tiers, features, pricing' },
      { label: 'Medical Data Lists', href: `${base}/config/medical-data`, icon: Stethoscope, description: 'Specialties, insurance, conditions & treatments' },
      { label: 'System Settings', href: `${base}/config/settings`, icon: Settings, description: 'Email templates and global settings' },
    ],
  },
  { label: 'Reporting & Analytics', href: `${base}/reports`, icon: BarChart3, description: 'Growth and KPIs' },
  {
    label: 'Community Moderation',
    icon: Shield,
    description: 'Reports, forum, user moderation',
    children: [
      { label: 'Reported Posts Queue', href: `${base}/community/reports`, icon: Shield, description: 'Flagged posts; dismiss or delete' },
      { label: 'Forum Management', href: `${base}/community/forum`, icon: ListChecks, description: 'View and delete posts' },
      { label: 'User Moderation', href: `${base}/community/users`, icon: UserX, description: 'Suspend or ban users' },
    ],
  },
  { label: 'Messages', href: `${base}/messages`, icon: MessageCircle, description: 'Direct communication with members' },
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
          <div className="font-semibold" style={{ color: 'var(--aip-teal)' }}>{session?.email || 'admin@aip.com'}</div>
          <Badge variant="outline" className="mt-1 border-[var(--aip-teal)] bg-transparent" style={{ color: 'var(--aip-teal)' }}>
            Admin
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2 mr-2 md:mr-4">
        <PortalThemeToggle />
        <MessageBell userId="admin" href="/admin/messages" />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="px-2 md:px-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Log Out</span>
      </Button>
    </>
  );

  return (
    <PortalShell
      sidebarItems={adminNavTree}
      headerTitle="Admin Portal"
      headerRight={headerRight}
      mainClassName="admin-main"
    >
      {children}
    </PortalShell>
  );
}
