'use client';

import { useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';
import { Playfair_Display } from 'next/font/google';
import { TopSearchBar } from '@/components/DoctorFilters';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export function FindSpecialistBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animationStyle = (delay: number) => {
    if (prefersReducedMotion) {
      return {
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      };
    }
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    };
  };

  return (
    <section
        id="find-specialist"
        ref={sectionRef}
        data-scroll-section
        className="relative w-full py-8 md:py-12 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue-alt to-brand-dark-blue/90"
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header – same text design as MissionStatementNewHome / BenefitsJumbledGrid (adapted for dark bg) */}
            <div className="text-center mb-8 md:mb-10" style={animationStyle(0)}>
              <span
                className={cn(
                  'inline-block px-4 py-1.5 bg-white/20 text-white font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 border border-white/30 backdrop-blur-sm',
                  playfairDisplay.className
                )}
              >
                Find a specialist
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-[1.1] tracking-tight">
                Quick Access to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-400">Quality Care</span>
              </h2>
              <p
                className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
                style={animationStyle(100)}
              >
                Find the right specialist quickly with our easy-to-use search tool. Filter by conditions, doctors, insurance, and location.
              </p>
            </div>
            <div
              className="w-full"
              style={animationStyle(400)}
            >
              <Suspense fallback={<div className="h-16 w-full bg-white/10 rounded-xl animate-pulse" />}>
                <TopSearchBar />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
  );
}
