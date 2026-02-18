'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { thriveFeatures } from '@/data/physiciansPage';
import { ShoppingCart, FileText, ShieldCheck, Network, Megaphone, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, keyof typeof LucideIcons> = {
  ShoppingCart: 'ShoppingCart',
  FileText: 'FileText',
  ShieldCheck: 'ShieldCheck',
  Network: 'Network',
  Megaphone: 'Megaphone',
  Briefcase: 'Briefcase',
};

export function ThriveFeatures() {
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
    const IconComponent = LucideIcons[iconMap[iconName] || 'Briefcase'] as React.ComponentType<{ className?: string }>;
    return IconComponent || Briefcase;
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden bg-white"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-dark-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

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
            <span className="inline-block px-4 py-1.5 bg-brand-dark-blue/10 text-brand-dark-blue font-bold text-xs uppercase tracking-[0.2em] rounded-full mb-4">
              Comprehensive Support
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue">
              Everything You Need to Thrive
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Comprehensive support for every aspect of your independent practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {thriveFeatures.map((feature, index) => {
              const IconComponent = getIcon(feature.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 100;
              // Alternate between blue and green accents
              const accentColor = index % 2 === 0 ? 'blue' : 'green';
              const isBlue = accentColor === 'blue';

              return (
                <Card
                  key={feature.id}
                  className={cn(
                    'group relative bg-white border-2 hover:border-transparent transition-all duration-300 overflow-hidden',
                    isBlue
                      ? 'hover:shadow-[0_20px_40px_rgba(15,95,168,0.15)] border-brand-dark-blue/20'
                      : 'hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] border-emerald-500/20'
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
                  {/* Gradient background on hover */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                      isBlue
                        ? 'bg-gradient-to-br from-brand-dark-blue/5 via-brand-dark-blue/3 to-transparent'
                        : 'bg-gradient-to-br from-emerald-500/5 via-emerald-400/3 to-transparent'
                    )}
                  />

                  {/* Top accent bar */}
                  <div
                    className={cn(
                      'h-1 w-full',
                      isBlue ? 'bg-brand-dark-blue' : 'bg-emerald-600'
                    )}
                  />

                  <CardContent className="p-6 md:p-8 relative z-10">
                    <div className="flex flex-col">
                      {/* Icon with colored background */}
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110',
                          isBlue
                            ? 'bg-brand-dark-blue/10 text-brand-dark-blue group-hover:bg-brand-dark-blue/20'
                            : 'bg-emerald-600/10 text-emerald-600 group-hover:bg-emerald-600/20'
                        )}
                      >
                        <IconComponent className="h-8 w-8" aria-hidden="true" />
                      </div>

                      {/* Title */}
                      <h3
                        className={cn(
                          'text-xl md:text-2xl font-bold mb-3 transition-colors duration-300',
                          isBlue ? 'text-brand-dark-blue' : 'text-emerald-700'
                        )}
                      >
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>

                  {/* Decorative corner element */}
                  <div
                    className={cn(
                      'absolute bottom-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300',
                      isBlue
                        ? 'bg-brand-dark-blue rounded-tl-full'
                        : 'bg-emerald-600 rounded-tl-full'
                    )}
                  />
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
