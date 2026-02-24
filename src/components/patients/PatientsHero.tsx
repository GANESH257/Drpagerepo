'use client';

import { useEffect, useState, useRef } from 'react';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export function PatientsHero() {
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
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleFindSpecialistClick = () => {
    const element = document.getElementById('find-specialist');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative mt-24 md:mt-28 py-16 md:py-24 lg:py-32 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/for_pt.png"
          alt="Patients"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/60 via-brand-dark-blue/50 to-brand-dark-blue/60 z-10" />

      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header – same text design as AboutHeroSection / PhysiciansHero (dark variant) */}
          <div
            className="mb-8 md:mb-10"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              className={`inline-block px-4 py-1.5 bg-white/20 text-white font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 backdrop-blur-sm ${playfairDisplay.className}`}
            >
              Patients
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-[1.1] tracking-tight">
              Personalized Care from Doctors Who Answer to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-300">
                You
              </span>
            </h1>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
            }}
          >
            <Button
              onClick={handleFindSpecialistClick}
              size="lg"
              className="bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              aria-label="Find your specialist"
            >
              <Search className="mr-2 h-5 w-5" aria-hidden="true" />
              Find Your Specialist
            </Button>

            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-white text-brand-dark-blue hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Browse all doctors"
            >
              <Link href="/doctors">
                Browse Doctors
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
