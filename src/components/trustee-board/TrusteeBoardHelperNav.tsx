'use client';

import { HelperNav } from '../HelperNav';
import { Users, Calendar, Bell, FileCheck } from 'lucide-react';

const navItems = [
  {
    label: 'Board Members',
    href: '#board',
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: 'Next Meeting',
    href: '#meeting',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    label: 'Announcements',
    href: '#announcements',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    label: 'Policies',
    href: '#policies',
    icon: <FileCheck className="h-4 w-4" />,
  },
];

export function TrusteeBoardHelperNav() {
  return <HelperNav items={navItems} />;
}
