'use client';

import { useEffect, useRef, useState } from 'react';
import { DoctorBenefitsPanel } from './DoctorBenefitsPanel';
import { AuthCard } from './AuthCard';
import { GenericCTASection } from '@/components/GenericCTASection';

export function JoinUsLayout() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 py-12 lg:py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 md:gap-8 lg:gap-10 max-w-6xl mx-auto">
          {/* Left Panel - Benefits */}
          <div
            className="w-full lg:w-1/2"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-50px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.4s, transform 1.8s ease-out 0.4s',
            }}
          >
            <DoctorBenefitsPanel />
          </div>

          {/* Right Panel - Auth Card */}
          <div 
            className="w-full lg:w-1/2 flex items-center justify-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(50px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.8s, transform 1.8s ease-out 0.8s',
            }}
          >
            <div className="w-full">
              <AuthCard />
            </div>
          </div>
        </div>
      </div>
      <GenericCTASection />
    </div>
  );
}
