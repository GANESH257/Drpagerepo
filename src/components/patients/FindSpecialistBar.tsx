'use client';

import { useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';
import { TopSearchBar } from '@/components/DoctorFilters';

export function FindSpecialistBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!sectionRef.current) return;

    const checkSticky = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      // Get the top offset of the header (approximately 84px on desktop, 80px on mobile)
      const headerOffset = window.innerWidth >= 768 ? 84 : 80;
      
      // Make sticky when section top passes the header
      // The section should become sticky when its top edge is at or above the header
      setIsSticky(rect.top <= headerOffset);
    };

    // Use Intersection Observer with proper rootMargin to account for header
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When section is not intersecting (scrolled past header), make sticky
          setIsSticky(!entry.isIntersecting);
        });
      },
      {
        threshold: 0,
        rootMargin: `-${window.innerWidth >= 768 ? 84 : 80}px 0px 0px 0px`, // Account for header height
      }
    );

    observer.observe(sectionRef.current);

    // Use throttled scroll listener for more reliable updates with Locomotive Scroll
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkSticky();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check initial state
    const timer = setTimeout(checkSticky, 100);

    // Listen to scroll events (works with both native scroll and Locomotive Scroll)
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timer);
    };
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
    <>
      {/* Sticky Search Bar - appears when scrolling past original section (desktop/tablet only) */}
      {isSticky && (
        <div
          className="hidden md:block fixed left-0 right-0 z-40 bg-gradient-to-br from-brand-dark-blue/95 via-brand-dark-blue-alt/95 to-brand-dark-blue/95 backdrop-blur-xl border-b border-white/10 py-3 md:py-4 shadow-xl transition-all duration-300 top-[5rem] md:top-[5.25rem]"
          style={{
            boxShadow: '0 10px 40px -5px rgba(0, 0, 0, 0.3), 0 0 20px rgba(29, 212, 196, 0.1)',
          }}
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Suspense fallback={<div className="h-16 w-full bg-white/10 rounded-xl animate-pulse" />}>
                <TopSearchBar />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Original Section */}
      <section
        id="find-specialist"
        ref={sectionRef}
        data-scroll-section
        className="relative w-full py-8 md:py-12 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue-alt to-brand-dark-blue/90"
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
              ref={searchBarRef}
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
    </>
  );
}
