'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Search } from 'lucide-react';

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  return (
    <>
      {/* Find a Practice - Above Join (Right Side) */}
      <div
        className="fixed bottom-24 right-4 z-[100] md:bottom-32 md:right-8 pointer-events-auto"
        style={{
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          visibility: 'visible',
        }}
      >
        <Link
          href="/practices"
          className="bg-brand-teal hover:bg-brand-teal/90 shadow-2xl hover:shadow-brand-teal/50 hover:scale-105 transition-all duration-300 focus-ring group text-sm md:text-base px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl flex items-center gap-2 font-semibold whitespace-nowrap inline-flex text-white no-underline cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #1DD4C4 0%, #1AB8A8 100%)',
            color: 'white',
            display: 'inline-flex',
          }}
        >
          <Search className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          <span className="font-semibold">Find a Practice</span>
        </Link>
      </div>

      {/* Join Our Network - Bottom Right */}
      <div
        className="fixed bottom-4 right-4 z-[100] md:bottom-8 md:right-8 pointer-events-auto"
        style={{
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          visibility: 'visible',
        }}
      >
        <Link
          href="/join-us"
          className="btn-gradient-dark-blue shadow-2xl hover:shadow-brand-dark-blue/50 hover:scale-105 transition-all duration-300 focus-ring group text-sm md:text-base px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl flex items-center gap-2 font-semibold whitespace-nowrap inline-flex text-white no-underline cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #0F5FA8 0%, #1DD4C4 100%)',
            color: 'white',
            display: 'inline-flex',
          }}
        >
          <Users className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
          <span className="font-semibold">Join Our Network</span>
        </Link>
      </div>
    </>
  );
}
