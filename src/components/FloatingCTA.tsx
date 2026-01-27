'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      // Show button after a short delay for smooth entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 md:bottom-8 md:right-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion 
          ? 'translateY(0) scale(1)' 
          : 'translateY(20px) scale(0.9)',
        transition: prefersReducedMotion
          ? 'opacity 0.3s ease'
          : 'opacity 0.5s ease-out 0.3s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
      }}
    >
      <Button
        asChild
        size="lg"
        variant="gradient-multi"
        className="shadow-2xl hover:shadow-brand-teal/50 hover:scale-105 transition-all duration-300 focus-ring group text-sm md:text-base px-4 md:px-6"
      >
        <Link href="/join-us" className="flex items-center gap-2">
          <Users className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
          <span className="font-semibold whitespace-nowrap">Join our Network</span>
        </Link>
      </Button>
    </div>
  );
}
