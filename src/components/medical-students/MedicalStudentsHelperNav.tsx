'use client';

import { HelperNav } from '../HelperNav';
import { HelpCircle, BookOpen, Wrench, FileText, Newspaper } from 'lucide-react';

const navItems = [
  {
    label: 'How to Use',
    href: '#how-to-use',
    icon: <HelpCircle className="h-4 w-4" />,
  },
  {
    label: 'Main Tracks',
    href: '#main-tracks',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    label: 'Quick Tools',
    href: '#quick-tools',
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    label: 'Articles',
    href: '#articles',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: 'Latest News',
    href: '#latest-news',
    icon: <Newspaper className="h-4 w-4" />,
  },
];

export function MedicalStudentsHelperNav() {
  return <HelperNav items={navItems} />;
}
