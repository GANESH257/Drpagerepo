'use client';

import { Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DarkModeToggle } from '@/components/DarkModeToggle';

const TOPBAR_LINK =
  'flex items-center gap-2 text-xs md:text-sm text-white/90 hover:text-brand-teal transition-colors duration-200 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-1 focus-visible:ring-offset-brand-dark-blue rounded px-1.5 py-0.5 -my-0.5';

export function TopBar() {
  const pathname = usePathname();

  if (pathname.startsWith('/doctor/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-9 md:h-10 bg-brand-dark-blue/95 backdrop-blur-sm border-b border-white/10 shadow-sm"
      data-scroll-exclude
      data-scroll-speed="0"
    >
      <div className="container mx-auto px-4 md:px-6 h-full" data-scroll-exclude>
        <div className="flex items-center justify-between h-full gap-4" data-scroll-exclude>
          <nav className="flex items-center gap-3 md:gap-4 flex-shrink-0 min-w-0" aria-label="Contact">
            <Link
              href="tel:+15551234567"
              className={TOPBAR_LINK}
              data-scroll-exclude
              data-scroll-speed="0"
              aria-label="Call (555) 123-4567"
            >
              <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 opacity-90 flex-shrink-0" aria-hidden />
              <span className="whitespace-nowrap">(555) 123-4567</span>
            </Link>
            <span className="text-white/40 text-xs md:text-sm flex-shrink-0" aria-hidden>
              |
            </span>
            <Link
              href="mailto:info@alliancephysicians.com"
              className={TOPBAR_LINK}
              data-scroll-exclude
              data-scroll-speed="0"
              aria-label="Email info@alliancephysicians.com"
            >
              <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 opacity-90 flex-shrink-0" aria-hidden />
              <span className="hidden sm:inline whitespace-nowrap">info@alliancephysicians.com</span>
              <span className="sm:hidden whitespace-nowrap">Email</span>
            </Link>
          </nav>

          <div className="flex-shrink-0" data-scroll-exclude data-scroll-speed="0">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
