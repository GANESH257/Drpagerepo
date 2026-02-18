'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { practiceResources } from '@/data/physiciansPage';
import { FileText, ShieldCheck, Megaphone, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, keyof typeof LucideIcons> = {
  FileText: 'FileText',
  ShieldCheck: 'ShieldCheck',
  Megaphone: 'Megaphone',
};

export function PracticeResources() {
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

  const getIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconMap[iconName] || 'FileText'] as React.ComponentType<{ className?: string }>;
    return IconComponent || FileText;
  };

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
              Practice Resources
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {practiceResources.map((resource, index) => {
              const IconComponent = getIcon(resource.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 100;
              const accentColor = index % 2 === 0 ? 'brand-dark-blue' : 'emerald-600';

              return (
                <Card
                  key={resource.id}
                  className="bg-white border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-5 md:p-6"
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
                  <CardContent className="p-0 flex flex-col">
                    {/* Icon pill */}
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                      accentColor === 'brand-dark-blue' 
                        ? 'bg-brand-dark-blue/10 text-brand-dark-blue' 
                        : 'bg-emerald-600/10 text-emerald-600'
                    )}>
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-bold text-brand-dark-blue mb-2">
                      {resource.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      {resource.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div
            className="text-center"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.6s',
            }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-brand-dark-blue to-emerald-600 text-white hover:from-brand-dark-blue/90 hover:to-emerald-600/90 shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="View all resources"
            >
              <Link href="/medical-students">
                View All Resources
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
