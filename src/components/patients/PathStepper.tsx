'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, Phone, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    number: '01',
    title: 'Search',
    description: 'Filter by specialty & location',
    icon: Search,
  },
  {
    number: '02',
    title: 'Compare',
    description: 'Read reviews & profiles',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Connect',
    description: 'Book directly online',
    icon: Phone,
  },
  {
    number: '04',
    title: 'Care',
    description: 'Receive personalized treatment',
    icon: Heart,
  },
];

export function PathStepper() {
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
              Your Path to Better Health
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              Simple steps to connect with the right care provider.
            </p>
          </div>

          {/* Desktop: Horizontal stepper with connecting lines */}
          <div className="hidden md:block relative">
            {/* Connector line */}
            <div
              className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: prefersReducedMotion
                  ? 'opacity 0.3s ease'
                  : 'opacity 0.6s ease-out 0.4s, transform 1s ease-out 0.4s',
              }}
            />

            <div className="flex items-start justify-between relative z-10">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const cardDelay = prefersReducedMotion ? 0 : index * 150;
                const accentColor = index % 2 === 0 ? 'brand-teal' : 'brand-dark-blue';

                return (
                  <div
                    key={step.number}
                    className="flex-1 flex flex-col items-center"
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
                    {/* Number badge */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4 shadow-md',
                        accentColor === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-dark-blue'
                      )}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                        accentColor === 'brand-teal'
                          ? 'bg-brand-teal/10 text-brand-teal'
                          : 'bg-brand-dark-blue/10 text-brand-dark-blue'
                      )}
                    >
                      <IconComponent className="h-8 w-8" aria-hidden="true" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-brand-dark-blue mb-2 text-center">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 text-center max-w-[150px]">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: Stacked cards with numbered badges */}
          <div className="md:hidden space-y-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const cardDelay = prefersReducedMotion ? 0 : index * 100;
              const accentColor = index % 2 === 0 ? 'brand-teal' : 'brand-dark-blue';

              return (
                <Card
                  key={step.number}
                  className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion
                      ? 'translateX(0) scale(1)'
                      : 'translateX(-20px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${cardDelay}ms`
                      : `opacity 0.8s ease-out ${cardDelay}ms, transform 0.8s ease-out ${cardDelay}ms`,
                  }}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    {/* Number badge */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md',
                        accentColor === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-dark-blue'
                      )}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                        accentColor === 'brand-teal'
                          ? 'bg-brand-teal/10 text-brand-teal'
                          : 'bg-brand-dark-blue/10 text-brand-dark-blue'
                      )}
                    >
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-brand-dark-blue mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
