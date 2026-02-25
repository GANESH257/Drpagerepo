'use client';

import { Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export function TopBar() {
  const pathname = usePathname();

  // Hide on dashboard / admin portal pages
  if (pathname.startsWith('/doctor/dashboard') || pathname.startsWith('/doctor/onboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-6 md:h-7 bg-brand-dark-blue border-b border-brand-teal/20">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Phone and Email */}
            <Link
              href="tel:+15551234567"
              className="flex items-center gap-1 text-[10px] md:text-xs text-white/90 hover:text-brand-teal transition-colors"
            >
              <Phone className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
              <span>(555) 123-4567</span>
            </Link>
            <Link
              href="mailto:info@alliancephysicians.com"
              className="flex items-center gap-1 text-[10px] md:text-xs text-white/90 hover:text-brand-teal transition-colors"
            >
              <Mail className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
              <span className="hidden sm:inline">info@alliancephysicians.com</span>
              <span className="sm:hidden">info@alliance...</span>
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />
        </div>
      </div>
    </div>
  );
}
