'use client';

import { useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TopSearchBar } from '@/components/DoctorFilters';
import { Search, Mail } from 'lucide-react';

export function QuickAccessCTA() {
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
      className="relative w-full py-8 md:py-12 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue-alt to-emerald-600/20"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6"
            style={animationStyle(0)}
          >
            Quick Access to Quality Care
          </h2>
          <p
            className="text-sm md:text-base text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto"
            style={animationStyle(200)}
          >
            Find the right specialist quickly with our easy-to-use search tool. Filter by conditions, doctors, insurance, and location.
          </p>
          <div
            className="w-full mb-6 md:mb-8"
            style={animationStyle(400)}
          >
            <Suspense fallback={<div className="h-16 w-full bg-white/10 rounded-xl animate-pulse" />}>
              <TopSearchBar />
            </Suspense>
          </div>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={animationStyle(600)}
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-dark-blue hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              aria-label="Find a doctor"
            >
              <Link href="/doctors">
                <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                Find a Doctor
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 border-2 border-emerald-600 hover:border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Contact us"
            >
              <Link href="/contact-us">
                <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
