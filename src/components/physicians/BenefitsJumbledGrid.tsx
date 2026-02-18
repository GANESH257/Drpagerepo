'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { physicianBenefits } from '@/data/physiciansPage';
import { Handshake, TrendingDown, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, keyof typeof LucideIcons> = {
  Handshake: 'Handshake',
  TrendingDown: 'TrendingDown',
  Users: 'Users',
  ShieldCheck: 'ShieldCheck',
};

export function BenefitsJumbledGrid() {
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
    const IconComponent = LucideIcons[iconMap[iconName] || 'Handshake'] as React.ComponentType<{ className?: string }>;
    return IconComponent || Handshake;
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
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
              Empower Your Practice
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              Join a powerful alliance that gives independent physicians the strength of a health system.
            </p>
          </div>

          {/* Desktop: Asymmetric 3-column grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 auto-rows-fr">
            {physicianBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 150;
              const isLarge = benefit.size === 'large';
              const accentColor = benefit.accentColor === 'blue' ? 'brand-dark-blue' : 'emerald-600';

              // Grid placement for asymmetric layout
              let gridClass = '';
              if (benefit.id === 'collective-bargaining') {
                gridClass = 'lg:col-span-2'; // Spans 2 columns
              } else if (benefit.id === 'clinical-autonomy') {
                gridClass = 'lg:col-span-2'; // Spans 2 columns
              }

              // Add colored backgrounds to specific cards
              let cardBgClass = 'bg-white';
              let hasImageBackground = false;
              if (benefit.id === 'collective-bargaining') {
                cardBgClass = 'bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90';
              } else if (benefit.id === 'strong-network') {
                cardBgClass = 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-500/20';
              } else if (benefit.id === 'clinical-autonomy') {
                hasImageBackground = true;
              }

              return (
                <Card
                  key={benefit.id}
                  className={cn(
                    'border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden',
                    !hasImageBackground && cardBgClass,
                    gridClass,
                    isLarge ? 'p-8' : 'p-6'
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
                  {/* Background Image for Total Clinical Autonomy */}
                  {hasImageBackground && (
                    <>
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/for_dr2.png"
                          alt="Total Clinical Autonomy"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/70 via-brand-dark-blue/60 to-brand-dark-blue/70 z-10" />
                    </>
                  )}

                  <CardContent className={cn(
                    "p-0 flex flex-col h-full",
                    hasImageBackground && "relative z-20"
                  )}>
                    {/* Top accent line */}
                    <div
                      className={cn(
                        'h-1 w-16 mb-4 rounded-full',
                        benefit.id === 'collective-bargaining' 
                          ? 'bg-white' 
                          : (benefit.id === 'strong-network'
                            ? 'bg-emerald-600'
                            : (hasImageBackground ? 'bg-white' : 'bg-emerald-600'))
                      )}
                    />

                    {/* Icon pill */}
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                      benefit.id === 'collective-bargaining'
                        ? 'bg-white/20 text-white'
                        : (hasImageBackground
                          ? 'bg-white/20 text-white'
                          : (benefit.id === 'strong-network'
                            ? 'bg-emerald-600/20 text-emerald-700'
                            : 'bg-emerald-600/10 text-emerald-600'))
                    )}>
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>

                    {/* Title */}
                    <h3 className={cn(
                      "text-xl md:text-2xl font-bold mb-3",
                      (benefit.id === 'collective-bargaining' || hasImageBackground)
                        ? "text-white"
                        : (benefit.id === 'strong-network' ? "text-emerald-700" : "text-brand-dark-blue")
                    )}>
                      {benefit.title}
                    </h3>

                    {/* Description */}
                    <p className={cn(
                      'mb-4 flex-grow',
                      (benefit.id === 'collective-bargaining' || hasImageBackground)
                        ? 'text-white/90'
                        : (benefit.id === 'strong-network' ? 'text-emerald-800' : 'text-gray-700'),
                      isLarge ? 'text-base md:text-lg' : 'text-sm md:text-base'
                    )}>
                      {benefit.description}
                    </p>

                    {/* Link button */}
                    {benefit.link && benefit.linkText && (
                      <div className="mt-auto">
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            'p-0 h-auto text-sm font-semibold hover:underline',
                            (benefit.id === 'collective-bargaining' || hasImageBackground)
                              ? 'text-white hover:text-white/80'
                              : (benefit.id === 'strong-network'
                                ? 'text-emerald-700 hover:text-emerald-700/80'
                                : 'text-emerald-600 hover:text-emerald-600/80')
                          )}
                        >
                          <Link href={benefit.link}>
                            {benefit.linkText}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tablet: 2-column staggered grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6">
            {physicianBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 150;
              const accentColor = benefit.accentColor === 'blue' ? 'brand-dark-blue' : 'emerald-600';

              // Add colored backgrounds
              let cardBgClass = 'bg-white';
              let hasImageBackground = false;
              if (benefit.id === 'collective-bargaining') {
                cardBgClass = 'bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90';
              } else if (benefit.id === 'strong-network') {
                cardBgClass = 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-500/20';
              } else if (benefit.id === 'clinical-autonomy') {
                hasImageBackground = true;
              }

              return (
                <Card
                  key={benefit.id}
                  className={cn(
                    'border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden',
                    !hasImageBackground && cardBgClass,
                    benefit.size === 'large' ? 'md:col-span-2 p-8' : 'p-6'
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
                  {/* Background Image for Total Clinical Autonomy */}
                  {hasImageBackground && (
                    <>
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/for_dr2.png"
                          alt="Total Clinical Autonomy"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/70 via-brand-dark-blue/60 to-brand-dark-blue/70 z-10" />
                    </>
                  )}

                  <CardContent className={cn(
                    "p-0 flex flex-col h-full",
                    hasImageBackground && "relative z-20"
                  )}>
                    <div
                      className={cn(
                        'h-1 w-16 mb-4 rounded-full',
                        benefit.id === 'collective-bargaining' 
                          ? 'bg-white' 
                          : (benefit.id === 'strong-network'
                            ? 'bg-emerald-600'
                            : (hasImageBackground ? 'bg-white' : 'bg-emerald-600'))
                      )}
                    />
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                      benefit.id === 'collective-bargaining'
                        ? 'bg-white/20 text-white'
                        : (hasImageBackground
                          ? 'bg-white/20 text-white'
                          : (benefit.id === 'strong-network'
                            ? 'bg-emerald-600/20 text-emerald-700'
                            : 'bg-emerald-600/10 text-emerald-600'))
                    )}>
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className={cn(
                      "text-xl font-bold mb-3",
                      (benefit.id === 'collective-bargaining' || hasImageBackground)
                        ? "text-white"
                        : (benefit.id === 'strong-network' ? "text-emerald-700" : "text-brand-dark-blue")
                    )}>
                      {benefit.title}
                    </h3>
                    <p className={cn(
                      'mb-4 flex-grow text-base',
                      (benefit.id === 'collective-bargaining' || hasImageBackground)
                        ? 'text-white/90'
                        : (benefit.id === 'strong-network' ? 'text-emerald-800' : 'text-gray-700')
                    )}>
                      {benefit.description}
                    </p>
                    {benefit.link && benefit.linkText && (
                      <div className="mt-auto">
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            'p-0 h-auto text-sm font-semibold hover:underline',
                            (benefit.id === 'collective-bargaining' || hasImageBackground)
                              ? 'text-white hover:text-white/80'
                              : (benefit.id === 'strong-network'
                                ? 'text-emerald-700 hover:text-emerald-700/80'
                                : 'text-emerald-600 hover:text-emerald-600/80')
                          )}
                        >
                          <Link href={benefit.link}>
                            {benefit.linkText}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mobile: Single column stack */}
          <div className="grid grid-cols-1 md:hidden gap-6">
            {physicianBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 100;
              const accentColor = benefit.accentColor === 'blue' ? 'brand-dark-blue' : 'emerald-600';

              // Add colored backgrounds
              let cardBgClass = 'bg-white';
              let hasImageBackground = false;
              if (benefit.id === 'collective-bargaining') {
                cardBgClass = 'bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90';
              } else if (benefit.id === 'strong-network') {
                cardBgClass = 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-500/20';
              } else if (benefit.id === 'clinical-autonomy') {
                hasImageBackground = true;
              }

              return (
                <Card
                  key={benefit.id}
                  className={cn(
                    'border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-6 relative overflow-hidden',
                    !hasImageBackground && cardBgClass
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
                  {/* Background Image for Total Clinical Autonomy */}
                  {hasImageBackground && (
                    <>
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/for_dr2.png"
                          alt="Total Clinical Autonomy"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/70 via-brand-dark-blue/60 to-brand-dark-blue/70 z-10" />
                    </>
                  )}

                  <CardContent className={cn(
                    "p-0 flex flex-col",
                    hasImageBackground && "relative z-20"
                  )}>
                    <div
                      className={cn(
                        'h-1 w-16 mb-4 rounded-full',
                        benefit.id === 'collective-bargaining' 
                          ? 'bg-white' 
                          : (benefit.id === 'strong-network'
                            ? 'bg-emerald-600'
                            : (hasImageBackground ? 'bg-white' : 'bg-emerald-600'))
                      )}
                    />
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                      benefit.id === 'collective-bargaining'
                        ? 'bg-white/20 text-white'
                        : (hasImageBackground
                          ? 'bg-white/20 text-white'
                          : (benefit.id === 'strong-network'
                            ? 'bg-emerald-600/20 text-emerald-700'
                            : 'bg-emerald-600/10 text-emerald-600'))
                    )}>
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className={cn(
                      "text-xl font-bold mb-3",
                      (benefit.id === 'collective-bargaining' || hasImageBackground)
                        ? "text-white"
                        : (benefit.id === 'strong-network' ? "text-emerald-700" : "text-brand-dark-blue")
                    )}>
                      {benefit.title}
                    </h3>
                    <p className={cn(
                      'mb-4 text-base',
                      (benefit.id === 'collective-bargaining' || hasImageBackground)
                        ? 'text-white/90'
                        : (benefit.id === 'strong-network' ? 'text-emerald-800' : 'text-gray-700')
                    )}>
                      {benefit.description}
                    </p>
                    {benefit.link && benefit.linkText && (
                      <div className="mt-auto">
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            'p-0 h-auto text-sm font-semibold hover:underline',
                            (benefit.id === 'collective-bargaining' || hasImageBackground)
                              ? 'text-white hover:text-white/80'
                              : (benefit.id === 'strong-network'
                                ? 'text-emerald-700 hover:text-emerald-700/80'
                                : 'text-emerald-600 hover:text-emerald-600/80')
                          )}
                        >
                          <Link href={benefit.link}>
                            {benefit.linkText}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    )}
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
