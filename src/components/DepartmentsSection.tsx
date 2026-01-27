'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { departments } from '@/data/departments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { getDepartmentIcon } from '@/lib/departmentIcons';

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
              Our Medical Specialties
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl leading-relaxed">
              Browse our medical specialties or use the search to find doctors in your needed specialty.
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

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => {
            const IconComponent = getDepartmentIcon(dept.slug);
            const cardDelay = prefersReducedMotion ? 0 : index * 300;
            // Alternate slide direction: even indices from left, odd from right
            const slideFromLeft = index % 2 === 0;
            const slideDistance = slideFromLeft ? '-80px' : '80px';

            const isHovered = hoveredCard === dept.slug;
            const magneticX = isHovered ? (mousePosition.x - 0) * 0.05 : 0;
            const magneticY = isHovered ? (mousePosition.y - 0) * 0.05 : 0;

            return (
              <Card
                key={dept.slug}
                className="h-full card-vibrant group focus-ring"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? `translateX(0) translateY(0) scale(1) rotate(0deg) translate(${magneticX}px, ${magneticY}px)` 
                    : `translateX(${slideDistance}) translateY(40px) scale(0.85) rotate(${slideFromLeft ? '-8deg' : '8deg'})`,
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${cardDelay}ms`
                    : `opacity 1.8s ease-out ${cardDelay}ms, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                }}
                onMouseEnter={(e) => {
                  setHoveredCard(dept.slug);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePosition({
                    x: e.clientX - rect.left - rect.width / 2,
                    y: e.clientY - rect.top - rect.height / 2,
                  });
                }}
                onMouseMove={(e) => {
                  if (isHovered) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({
                      x: e.clientX - rect.left - rect.width / 2,
                      y: e.clientY - rect.top - rect.height / 2,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 h-full">
                    {/* Icon */}
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center group-hover:bg-brand-teal/20 transition-all duration-300 hover-scale animate-float">
                        <IconComponent className="h-7 w-7" aria-hidden="true" />
                      </div>
                    </div>

                    {/* Department Name */}
                    <h3 className="text-xl font-semibold text-brand-dark-blue group-hover:text-brand-teal transition-colors">
                      {dept.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow">
                      {dept.description}
                    </p>

                    {/* CTA Button */}
                    <Link
                      href={`/doctors?specialty=${dept.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors mt-auto group/link focus-ring rounded-md px-1 -ml-1"
                    >
                      View Doctors
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
