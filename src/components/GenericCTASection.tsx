'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface GenericCTASectionProps {
  /** When true, only show the left (Join) CTA — e.g. on physicians page where the patient CTA is not needed */
  hideRightPanel?: boolean;
}

export function GenericCTASection({ hideRightPanel = false }: GenericCTASectionProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

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
    }
  }, []);

  const slideInTransition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';

  const leftPanelStyle = (): React.CSSProperties => {
    if (prefersReducedMotion) {
      return { opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' };
    }
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
      transition: `opacity 0.6s ease-out, ${slideInTransition}`,
    };
  };

  const rightPanelStyle = (): React.CSSProperties => {
    if (prefersReducedMotion) {
      return { opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' };
    }
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: `opacity 0.6s ease-out 0.15s, ${slideInTransition} 0.15s`,
    };
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-8 md:py-10"
    >
      <div className={`grid overflow-hidden ${hideRightPanel ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Left Section – slides in from left, glass on hover */}
        <div
          className="group relative py-8 md:py-10 px-4 md:px-6 lg:px-8 flex items-center justify-center min-h-[280px] md:min-h-[300px] overflow-hidden"
          style={leftPanelStyle()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90" aria-hidden />
          <div className="relative z-10 max-w-xl mx-auto w-full flex items-center justify-center">
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 py-8 px-6 md:py-10 md:px-8 text-center shadow-lg transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/15 group-hover:backdrop-blur-xl group-hover:shadow-xl group-hover:shadow-black/15">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                Ready to join the Alliance?
              </h2>
              <p className="text-base md:text-lg text-white/95 mb-4">
                Start your membership journey today and connect with a community of independent physicians dedicated to excellence in healthcare.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-brand-dark-blue hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/join-us">
                  Join our Network
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Section – patient CTA; hidden on physicians page */}
        {!hideRightPanel && (
        <div
          className="group relative py-8 md:py-10 px-4 md:px-6 lg:px-8 flex items-center justify-center min-h-[280px] md:min-h-[300px] overflow-hidden"
          style={rightPanelStyle()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal via-brand-teal/95 to-brand-teal/90" aria-hidden />
          <div className="relative z-10 max-w-xl mx-auto w-full flex items-center justify-center">
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 py-8 px-6 md:py-10 md:px-8 text-center shadow-lg transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/15 group-hover:backdrop-blur-xl group-hover:shadow-xl group-hover:shadow-black/15">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                Find Your Healthcare Provider
              </h2>
              <p className="text-base md:text-lg text-white/95 mb-4">
                Connect with trusted independent physicians in your area. Search by specialty, location, or insurance to find the right care for you.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-brand-teal hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/practices">
                  Find a Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
