'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

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

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div 
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 md:mb-16 gap-4 md:gap-6"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion 
              ? 'opacity 0.3s ease' 
              : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
          }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue">
              Medical Specialties
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl leading-relaxed">
              Find specialists across a wide range of medical fields.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button 
              asChild 
              size="lg" 
              className="bg-brand-teal hover:bg-brand-teal/90 text-white focus-ring transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Link href="/doctors">
                View All Doctors
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {specialties.map((specialty, index) => {
            const cardDelay = prefersReducedMotion ? 0 : index * 100;

            return (
              <Card
                key={specialty.slug}
                className="bg-white border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group focus-ring"
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
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Image
                    src={specialty.iconPath}
                    alt={`${specialty.name} icon`}
                    width={64}
                    height={64}
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
      </div>
    </section>
  );
}
