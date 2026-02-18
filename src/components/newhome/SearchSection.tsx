'use client';

import { useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';
import { TopSearchBar } from '../DoctorFilters';

export function SearchSection() {
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
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    };
  };

  return (
            <section 
      ref={sectionRef}
      className="relative w-full mt-12 md:mt-0 py-8 md:py-12 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue-alt to-brand-dark-blue/90"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6 text-center"
            style={animationStyle(0)}
          >
            Quick Access to Quality Care
          </h2>
          <p 
            className="text-sm md:text-base text-gray-300 mb-6 md:mb-8 text-center max-w-2xl mx-auto"
            style={animationStyle(200)}
          >
            Find the right specialist quickly with our easy-to-use search tool. Filter by conditions, doctors, insurance, and location.
          </p>
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
