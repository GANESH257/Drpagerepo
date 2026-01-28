'use client';

import { HelperNav } from '../HelperNav';
import { Newspaper, Filter, Heart, Shield, BookOpen } from 'lucide-react';

const navItems = [
  {
    label: 'Latest News',
    href: '#latest-news',
    icon: <Newspaper className="h-4 w-4" />,
  },
  {
    label: 'Disease Topics',
    href: '#disease-topics',
    icon: <Filter className="h-4 w-4" />,
  },
  {
    label: 'Prevention & Wellness',
    href: '#prevention',
    icon: <Heart className="h-4 w-4" />,
  },
  {
    label: 'Insurance',
    href: '#insurance',
    icon: <Shield className="h-4 w-4" />,
  },
  {
    label: 'Publications',
    href: '#publications',
    icon: <BookOpen className="h-4 w-4" />,
  },
];

export function PublicHealthHelperNav() {
  return <HelperNav items={navItems} />;
}
