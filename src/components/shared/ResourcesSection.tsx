'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  accentColor: 'brand-dark-blue' | 'emerald-600' | 'brand-teal';
}

const resources: Resource[] = [
  {
    id: 'public-health',
    title: 'Public Health',
    description: 'Stay informed with the latest public health updates, articles, and evidence-based resources.',
    icon: FileText,
    link: '/public-health',
    accentColor: 'brand-dark-blue',
  },
  {
    id: 'students',
    title: 'Students',
    description: 'Comprehensive resources for medical students including guides, tools, and articles from experienced physicians.',
    icon: GraduationCap,
    link: '/medical-students',
    accentColor: 'emerald-600',
  },
  {
    id: 'trustee-board',
    title: 'Trustee Board',
    description: 'Access governance information, policies, announcements, and board member details.',
    icon: Users,
    link: '/trustee-board',
    accentColor: 'brand-teal',
  },
];

export function ResourcesSection() {
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
        <div className="max-w-6xl mx-auto">
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
              Resources
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Access valuable resources, information, and tools across our network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {resources.map((resource, index) => {
              const IconComponent = resource.icon;
              const cardDelay = prefersReducedMotion ? 0 : index * 100;

              return (
                <Link
                  key={resource.id}
                  href={resource.link}
                  className="block h-full"
                >
                  <Card
                    className={cn(
                      'bg-white border-2 border-gray-100 hover:border-opacity-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 p-6 md:p-8 h-full cursor-pointer group relative overflow-hidden',
                      resource.accentColor === 'brand-dark-blue' && 'hover:border-brand-dark-blue',
                      resource.accentColor === 'emerald-600' && 'hover:border-emerald-600',
                      resource.accentColor === 'brand-teal' && 'hover:border-brand-teal'
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
                  >
                    {/* Decorative gradient overlay on hover */}
                    <div className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
                      resource.accentColor === 'brand-dark-blue' && 'bg-gradient-to-br from-brand-dark-blue/5 to-transparent',
                      resource.accentColor === 'emerald-600' && 'bg-gradient-to-br from-emerald-600/5 to-transparent',
                      resource.accentColor === 'brand-teal' && 'bg-gradient-to-br from-brand-teal/5 to-transparent'
                    )} />
                    
                    <CardContent className="p-0 flex flex-col h-full relative z-10">
                      {/* Icon with enhanced styling */}
                      <div className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110',
                        resource.accentColor === 'brand-dark-blue' 
                          ? 'bg-gradient-to-br from-brand-dark-blue/10 to-brand-dark-blue/5 text-brand-dark-blue group-hover:from-brand-dark-blue/20 group-hover:to-brand-dark-blue/10' 
                          : resource.accentColor === 'emerald-600'
                          ? 'bg-gradient-to-br from-emerald-600/10 to-emerald-600/5 text-emerald-600 group-hover:from-emerald-600/20 group-hover:to-emerald-600/10'
                          : 'bg-gradient-to-br from-brand-teal/10 to-brand-teal/5 text-brand-teal group-hover:from-brand-teal/20 group-hover:to-brand-teal/10'
                      )}>
                        <IconComponent className="h-8 w-8" aria-hidden="true" />
                      </div>

                      {/* Title */}
                      <h3 className={cn(
                        'text-xl md:text-2xl font-bold mb-3 transition-colors',
                        resource.accentColor === 'brand-dark-blue' && 'text-brand-dark-blue group-hover:text-brand-dark-blue',
                        resource.accentColor === 'emerald-600' && 'text-emerald-700 group-hover:text-emerald-600',
                        resource.accentColor === 'brand-teal' && 'text-brand-teal group-hover:text-brand-dark-blue'
                      )}>
                        {resource.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow mb-6">
                        {resource.description}
                      </p>

                      {/* Enhanced CTA */}
                      <div className={cn(
                        'flex items-center text-sm font-semibold transition-all duration-300 mt-auto pt-4 border-t border-gray-100 group-hover:border-opacity-50',
                        resource.accentColor === 'brand-dark-blue' && 'text-brand-dark-blue group-hover:text-brand-dark-blue',
                        resource.accentColor === 'emerald-600' && 'text-emerald-600 group-hover:text-emerald-700',
                        resource.accentColor === 'brand-teal' && 'text-brand-teal group-hover:text-brand-dark-blue'
                      )}>
                        <span>Learn More</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
