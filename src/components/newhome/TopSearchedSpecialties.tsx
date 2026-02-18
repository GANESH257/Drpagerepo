'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Specialty {
  name: string;
  slug: string;
  iconPath: string;
  departmentSlug?: string; // For linking to department page
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
    name: 'Pediatrics',
    slug: 'pediatrics',
    iconPath: '/Icons/icon_pediatrics.png',
    departmentSlug: 'pediatrics',
  },
  {
    name: 'Orthopedics',
    slug: 'orthopedics',
    iconPath: '/Icons/icon_orthopedics.png',
    departmentSlug: 'orthopedic-spine',
  },
  {
    name: 'Neurology',
    slug: 'neurology',
    iconPath: '/Icons/icon_neurology.png',
    departmentSlug: 'neurology',
  },
  {
    name: 'Gastroenterology',
    slug: 'gastroenterology',
    iconPath: '/Icons/icon_gastroenterology.png',
    departmentSlug: 'gastroenterology',
  },
  {
    name: 'Mental Health',
    slug: 'mental-health',
    iconPath: '/Icons/icon_psychiatry.png',
    departmentSlug: 'psychiatry',
  },
];

export function TopSearchedSpecialties() {
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

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div
            className="text-center mb-12 md:mb-16"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
            }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue">
              Top Searched Specialties
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {specialties.map((specialty, index) => {
              const cardDelay = prefersReducedMotion ? 0 : index * 100;
              const accentColor = index % 2 === 0 ? 'brand-teal' : 'brand-dark-blue';

              return (
                <Card
                  key={specialty.slug}
                  className={cn(
                    'bg-white border-2 border-gray-100 hover:border-brand-teal/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden',
                    accentColor === 'brand-teal'
                      ? 'hover:border-brand-teal'
                      : 'hover:border-brand-dark-blue'
                  )}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion
                      ? 'translateY(0) scale(1)'
                      : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${cardDelay}ms`
                      : `opacity 0.8s ease-out ${cardDelay}ms, transform 0.8s ease-out ${cardDelay}ms`,
                  }}
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
                  {/* Hover gradient overlay */}
                  <div className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
                    accentColor === 'brand-teal'
                      ? 'bg-gradient-to-br from-brand-teal/5 to-transparent'
                      : 'bg-gradient-to-br from-brand-dark-blue/5 to-transparent'
                  )} />
                  
                  <CardContent className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
                    {/* Icon */}
                    <Image
                      src={specialty.iconPath}
                      alt={`${specialty.name} icon`}
                      width={80}
                      height={80}
                      className="h-16 w-16 md:h-20 md:w-20 mb-4 drop-shadow-lg transition-all duration-300 group-hover:drop-shadow-xl group-hover:scale-110"
                    />
                    <h3 className="text-base md:text-lg font-semibold text-brand-dark-blue group-hover:text-brand-teal transition-colors duration-300">
                      {specialty.name}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div
            className="text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.8s, transform 0.8s ease-out 0.8s',
            }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="View all medical specialties"
            >
              <Link href="/doctors">
                View All Specialties
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
