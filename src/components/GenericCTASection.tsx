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

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
        transition: prefersReducedMotion
          ? 'opacity 0.3s ease'
          : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
      }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal via-brand-teal/90 to-brand-dark-blue" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-blue/20 via-transparent to-brand-teal/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to join the Alliance?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Start your membership journey today and connect with a community of independent physicians dedicated to excellence in healthcare.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="gradient-multi"
              className="bg-white text-brand-teal hover:bg-gray-100 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/join-us">
                Join our Network
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:border-white hover:text-white w-full sm:w-auto transition-all"
              asChild
            >
              <Link href="/doctors">
                Find a Doctor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
