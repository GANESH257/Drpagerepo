'use client';

import { Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-10 md:h-12 bg-brand-dark-blue border-b border-brand-teal/20">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full gap-4 md:gap-6">
          {/* Left side - Phone and Email */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="tel:+15551234567"
              className="flex items-center gap-1.5 text-xs text-white/90 hover:text-brand-teal transition-colors"
            >
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline">(555) 123-4567</span>
              <span className="sm:hidden">(555) 123-4567</span>
            </Link>
            <Link
              href="mailto:info@alliancephysicians.com"
              className="flex items-center gap-1.5 text-xs text-white/90 hover:text-brand-teal transition-colors"
            >
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="hidden md:inline">info@alliancephysicians.com</span>
              <span className="md:hidden">info@alliance...</span>
            </Link>
          </div>

          {/* Right side - CTA Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5 flex-shrink-0">
            <Button 
              asChild 
              variant="outline" 
              size="sm"
              className="border-brand-teal/50 text-white hover:bg-brand-teal hover:text-white bg-transparent text-sm md:text-base px-3 md:px-4 lg:px-5 h-8 md:h-9"
            >
              <Link href="/join-us">Join Us</Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-transparent text-sm md:text-base px-3 md:px-4 lg:px-5 h-8 md:h-9"
            >
              <Link href="/join-us">Sign In</Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              size="sm"
              className="border-brand-teal/50 text-white hover:bg-brand-teal hover:text-white bg-transparent text-sm md:text-base px-3 md:px-4 lg:px-5 h-8 md:h-9"
            >
              <Link href="/doctors">Find a Doctor</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
