'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Exclude footer from dashboard and admin pages
  const isDashboardPage = pathname?.startsWith('/doctor/dashboard') || pathname?.startsWith('/admin');
  
  if (isDashboardPage) {
    return null;
  }
  
  return <Footer />;
}
