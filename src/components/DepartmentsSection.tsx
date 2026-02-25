'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

interface Specialty {
  name: string;
  slug: string;
  iconPath: string;
  departmentSlug?: string;
}

const specialties: Specialty[] = [
  {
    name: 'Primary Care',
    slug: 'primary-care',
    iconPath: '/Icons/icon_primary_care.png',
    departmentSlug: 'family-practice',
  },
  {
    name: 'Cardiology',
    slug: 'cardiology',
    iconPath: '/Icons/icon_cardiology.png',
    departmentSlug: 'cardiology',
  },
  {
    name: 'Dermatology',
    slug: 'dermatology',
    iconPath: '/Icons/icon_dermatology.png',
    departmentSlug: 'dermatology',
  },
  {
    name: 'Gastroenterology',
    slug: 'gastroenterology',
    iconPath: '/Icons/icon_gastroenterology.png',
    departmentSlug: 'gastroenterology',
  },
  {
    name: 'Neurology',
    slug: 'neurology',
    iconPath: '/Icons/icon_neurology.png',
    departmentSlug: 'neurology',
  },
  {
    name: 'Ophthalmology',
    slug: 'ophthalmology',
    iconPath: '/Icons/icon_ophthalmology.png',
    departmentSlug: 'ophthalmology',
  },
  {
    name: 'Orthopedics',
    slug: 'orthopedics',
    iconPath: '/Icons/icon_orthopedics.png',
    departmentSlug: 'orthopedic-spine',
  },
  {
    name: 'Pediatrics',
    slug: 'pediatrics',
    iconPath: '/Icons/icon_pediatrics.png',
    departmentSlug: 'pediatrics',
  },
  {
    name: 'Psychiatry',
    slug: 'psychiatry',
    iconPath: '/Icons/icon_psychiatry.png',
    departmentSlug: 'psychiatry',
  },
  {
    name: 'Pulmonology',
    slug: 'pulmonology',
    iconPath: '/Icons/icon_pulmonology.png',
    departmentSlug: 'pulmonology',
  },
];

export function DepartmentsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
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

  return (
    <section 
      ref={sectionRef} 
      id="departments" 
      className="py-16 md:py-24 relative skin-gridline overflow-hidden"
    >
      {/* NOTE (client feedback): 3D animated stethoscope shapes background commented out – animation was "too much".
          To restore or change: uncomment the block below. CSS for .departments-3d-bg and .departments-stethoscope
          lives in globals.css (search "departments-3d-bg"); shapes/opacity/speed can be adjusted there. */}
      {/* <div className="departments-3d-bg" aria-hidden>
        <div className="departments-3d-inner">
          <Stethoscope className="departments-stethoscope departments-stethoscope-center-top" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-1" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-2" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-3" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-4" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-5" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-6" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-7" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-8" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-9" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-10" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-11" strokeWidth={2} />
          <Stethoscope className="departments-stethoscope departments-stethoscope-12" strokeWidth={2} />
        </div>
      </div> */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header – same text design as MissionStatementNewHome */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-10 gap-4 md:gap-6"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion
              ? 'opacity 0.3s ease'
              : 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div>
            <span
              className={cn(
                'inline-block px-4 py-1.5 bg-brand-dark-blue/10 text-brand-dark-blue font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 border border-brand-dark-blue/20',
                playfairDisplay.className
              )}
            >
              Our Specialties
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
              Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">Specialties</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
              Find specialists across a wide range of medical fields.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-lg hover:shadow-xl transition-all duration-300 focus-ring hover:scale-105"
            >
              <Link href="/doctors">
                View All Doctors
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Specialties Grid – standard card design */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {specialties.map((specialty, index) => {
            const cardDelay = prefersReducedMotion ? 0 : index * 100;

            return (
              <div
                key={specialty.slug}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                  transition: prefersReducedMotion ? `opacity 0.3s ease ${cardDelay}ms` : `opacity 0.8s ease-out ${cardDelay}ms, transform 0.8s ease-out ${cardDelay}ms`,
                }}
              >
                <Card
                  className="group relative overflow-hidden cursor-pointer focus-ring transition-all duration-500 ease-out data-scroll-exclude bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02] hover:bg-white/75"
                  onClick={() => {
                    window.location.href = `/doctors?specialty=${specialty.departmentSlug || specialty.slug}`;
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      window.location.href = `/doctors?specialty=${specialty.departmentSlug || specialty.slug}`;
                    }
                  }}
                  aria-label={`Browse ${specialty.name} specialists`}
                >
                  {/* Standard card layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-brand-teal/10 pointer-events-none group-hover:opacity-80 transition-opacity duration-500 z-0" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/5 via-transparent to-brand-teal/5 pointer-events-none z-0" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/15 via-brand-teal/10 to-brand-dark-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" aria-hidden />
                  <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/10 via-brand-teal/5 to-transparent animate-gradient-shift" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-brand-teal/5 to-brand-dark-blue/10 animate-gradient-shift-reverse" />
                  </div>
                  <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0" aria-hidden>
                    <div className="absolute inset-0 floating" style={{ backgroundImage: 'radial-gradient(circle, rgba(15, 95, 168, 0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  </div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-teal/15 group-hover:bg-brand-teal/30 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500 z-0" aria-hidden />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-dark-blue/15 group-hover:bg-brand-dark-blue/30 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500 z-0" aria-hidden />

                  <CardContent className="relative z-10 p-6 flex flex-col items-center text-center">
                    <div className={cn('w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-2xl relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)] bg-gradient-to-br from-brand-dark-blue to-brand-teal', isVisible && !prefersReducedMotion && 'pulsate-bck-normal')}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                      <Image
                        src={specialty.iconPath}
                        alt=""
                        width={64}
                        height={64}
                        className="h-14 w-14 md:h-16 md:w-16 object-contain rounded-3xl relative z-10 drop-shadow-md"
                        aria-hidden
                      />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-brand-dark-blue group-hover:text-brand-teal transition-colors duration-300">
                      {specialty.name}
                    </h3>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
