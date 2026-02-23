'use client';

import { Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DarkModeToggle } from '@/components/DarkModeToggle';

export function TopBar() {
  const pathname = usePathname();

  // Hide on dashboard / admin portal pages
  if (pathname.startsWith('/doctor/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-6 md:h-7 bg-brand-dark-blue border-b border-brand-teal/20" data-scroll-exclude>
      <div className="container mx-auto px-4 h-full" data-scroll-exclude>
        <div className="flex items-center justify-between h-full gap-3 md:gap-4" data-scroll-exclude>
          <div className="flex items-center gap-3 md:gap-4" data-scroll-exclude style={{ transform: 'translate3d(0, 0, 0)', willChange: 'auto' } as React.CSSProperties}>
            {/* Phone and Email */}
            <Link
              href="tel:+15551234567"
              className="flex items-center gap-1 text-[10px] md:text-xs text-white/90 hover:text-brand-teal transition-colors flex-shrink-0"
              data-scroll-exclude
              data-scroll-speed="0"
              style={{
                transform: 'translate3d(0, 0, 0)',
                willChange: 'auto',
                position: 'relative',
                width: 'fit-content',
                minWidth: 'fit-content',
                maxWidth: 'fit-content',
                flexShrink: 0,
                flexGrow: 0,
                display: 'inline-flex'
              } as React.CSSProperties}
            >
              <Phone className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" data-scroll-speed="0" />
              <span data-scroll-speed="0" className="whitespace-nowrap">(555) 123-4567</span>
            </Link>
            <Link
              href="mailto:info@alliancephysicians.com"
              className="flex items-center gap-1 text-[10px] md:text-xs text-white/90 hover:text-brand-teal transition-colors flex-shrink-0"
              data-scroll-exclude
              data-scroll-speed="0"
              style={{
                transform: 'translate3d(0, 0, 0)',
                willChange: 'auto',
                position: 'relative',
                width: 'fit-content',
                minWidth: 'fit-content',
                maxWidth: 'fit-content',
                flexShrink: 0,
                flexGrow: 0,
                display: 'inline-flex'
              } as React.CSSProperties}
            >
              <Mail className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" data-scroll-speed="0" />
              <span className="hidden sm:inline whitespace-nowrap" data-scroll-speed="0">info@alliancephysicians.com</span>
              <span className="sm:hidden whitespace-nowrap" data-scroll-speed="0">info@alliance...</span>
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <div data-scroll-exclude>
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
