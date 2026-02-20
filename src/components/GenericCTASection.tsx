'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function GenericCTASection() {
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
      transition: `opacity 1s ease-out ${delay}ms, transform 1s ease-out ${delay}ms`,
    };
  };

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden py-8 md:py-10"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
        transition: prefersReducedMotion
          ? 'opacity 0.3s ease'
          : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section - For Physicians */}
        <div 
          className="bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90 py-8 md:py-10 px-4 md:px-6 lg:px-8 text-white flex items-center justify-center min-h-[280px] md:min-h-[300px]"
          style={animationStyle(0)}
        >
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Ready to join the Alliance?
            </h2>
            <p className="text-base md:text-lg text-white/90 mb-4">
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

        {/* Right Section - For Patients */}
        <div 
          className="bg-gradient-to-br from-brand-teal via-brand-teal/95 to-brand-teal/90 py-8 md:py-10 px-4 md:px-6 lg:px-8 text-white flex items-center justify-center min-h-[280px] md:min-h-[300px]"
          style={animationStyle(200)}
        >
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Find Your Healthcare Provider
            </h2>
            <p className="text-base md:text-lg text-white/90 mb-4">
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
    </section>
  );
}
