'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { patientBenefits } from '@/data/patientsPage';
import { Award, Clock, Heart, DollarSign, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, keyof typeof LucideIcons> = {
  Award: 'Award',
  Clock: 'Clock',
  Heart: 'Heart',
  DollarSign: 'DollarSign',
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
    const IconComponent = LucideIcons[iconMap[iconName] || 'Award'] as React.ComponentType<{ className?: string }>;
    return IconComponent || Award;
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
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion
                  ? 'opacity 0.3s ease 0.1s'
                  : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
              }}
            >
              Why Choose Independent Physicians?
            </h2>
            <p 
              className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
                transition: prefersReducedMotion
                  ? 'opacity 0.3s ease 0.3s'
                  : 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
              }}
            >
              Experience healthcare the way it should be - personal, accessible, and transparent.
            </p>
          </div>

          {/* Desktop: Asymmetric 3-column grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 auto-rows-fr">
            {patientBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 150;
              const isLarge = benefit.size === 'large';
              const accentColor = benefit.accentColor === 'teal' ? 'brand-teal' : 'brand-dark-blue';

              // Grid placement for asymmetric layout
              let gridClass = '';
              if (benefit.id === 'top-rated') {
                gridClass = 'lg:col-span-2'; // Spans 2 columns
              } else if (benefit.id === 'transparent-pricing') {
                gridClass = 'lg:col-span-2'; // Spans 2 columns (removed row-span-2 to make it smaller)
              }

              // Add colored backgrounds to specific cards
              let cardBgClass = 'bg-white';
              let hasImageBackground = false;
              if (benefit.id === 'top-rated') {
                cardBgClass = 'bg-gradient-to-br from-brand-dark-blue/10 via-brand-dark-blue/5 to-brand-dark-blue/10';
              } else if (benefit.id === 'personal-connection') {
                cardBgClass = 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-500/20';
              } else if (benefit.id === 'transparent-pricing') {
                hasImageBackground = true;
              }

              return (
                <Card
                  key={benefit.id}
                  className={cn(
                    'group border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden',
                    !hasImageBackground && cardBgClass,
                    !hasImageBackground && 'card-bg-animated card-bg-gradient card-bg-particles',
                    gridClass,
                    benefit.id === 'transparent-pricing' ? 'p-6' : (isLarge ? 'p-8' : 'p-6')
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
                  {/* Background Image for Transparent Pricing */}
                  {hasImageBackground && (
                    <>
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/for_pt2.png"
                          alt="Transparent Pricing"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/70 via-brand-dark-blue/60 to-brand-dark-blue/70 z-10" />
                    </>
                  )}
                  
                  <CardContent className={cn(
                    "p-0 flex flex-col h-full items-center text-center",
                    hasImageBackground && "relative z-20"
                  )}>
                    {/* Top accent line */}
                    <div
                      className={cn(
                        'h-1 w-16 mb-4 rounded-full mx-auto',
                        benefit.id === 'personal-connection'
                          ? 'bg-emerald-600'
                          : (hasImageBackground ? 'bg-white' : (accentColor === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-dark-blue'))
                      )}
                    />

                    {/* Icon pill with animations */}
                    <div 
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 relative z-10',
                      benefit.id === 'personal-connection'
                        ? 'bg-emerald-600/20 text-emerald-700'
                        : (hasImageBackground
                          ? 'bg-white/20 text-white'
                          : (accentColor === 'brand-teal' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-dark-blue/10 text-brand-dark-blue'))
                      )}
                      style={{
                        animation: isVisible && !prefersReducedMotion 
                          ? `iconScaleIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay + 200}ms forwards, iconFloat 4s ease-in-out ${cardDelay + 1200}ms infinite`
                          : 'none',
                        opacity: isVisible ? 1 : 0,
                      }}
                    >
                      <IconComponent 
                        className={cn(
                          "h-6 w-6 transition-all duration-300 relative z-10",
                          isVisible && !prefersReducedMotion && "icon-pulse-glow"
                        )} 
                        aria-hidden="true" 
                      />
                    </div>

                    {/* Title */}
                    <h3 
                      className={cn(
                        "text-xl md:text-2xl font-bold mb-3 relative z-10",
                        isVisible && !prefersReducedMotion && "text-glow-animated",
                      (hasImageBackground || benefit.id === 'personal-connection')
                        ? (hasImageBackground ? "text-white" : "text-emerald-700")
                        : "text-brand-dark-blue"
                      )}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay + 300}ms`
                          : `opacity 0.6s ease-out ${cardDelay + 300}ms, transform 0.6s ease-out ${cardDelay + 300}ms`,
                        animation: isVisible && !prefersReducedMotion 
                          ? `textRevealGlow 0.8s ease-out ${cardDelay + 300}ms forwards`
                          : 'none',
                      }}
                    >
                      {benefit.title}
                    </h3>

                    {/* Description with fade in animation */}
                    <p 
                      className={cn(
                        'mb-4 flex-grow relative z-10',
                      hasImageBackground
                        ? 'text-white/90'
                        : (benefit.id === 'personal-connection' ? 'text-emerald-800' : 'text-gray-700'),
                      isLarge ? 'text-base md:text-lg' : 'text-sm md:text-base'
                      )}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay + 500}ms`
                          : `opacity 0.8s ease-out ${cardDelay + 500}ms, transform 0.8s ease-out ${cardDelay + 500}ms`,
                        animation: isVisible && !prefersReducedMotion 
                          ? `textRevealGlow 1s ease-out ${cardDelay + 500}ms forwards`
                          : 'none',
                      }}
                    >
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
                            hasImageBackground
                              ? 'text-white hover:text-white/80'
                              : (benefit.id === 'personal-connection'
                                ? 'text-emerald-700 hover:text-emerald-700/80'
                                : (accentColor === 'brand-teal' ? 'text-brand-teal hover:text-brand-teal/80' : 'text-brand-dark-blue hover:text-brand-dark-blue/80'))
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
            {patientBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 150;
              const accentColor = benefit.accentColor === 'teal' ? 'brand-teal' : 'brand-dark-blue';

              // Add colored backgrounds to specific cards
              let cardBgClass = 'bg-white';
              let hasImageBackground = false;
              if (benefit.id === 'top-rated') {
                cardBgClass = 'bg-gradient-to-br from-brand-dark-blue/10 via-brand-dark-blue/5 to-brand-dark-blue/10';
              } else if (benefit.id === 'personal-connection') {
                cardBgClass = 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-500/20';
              } else if (benefit.id === 'transparent-pricing') {
                hasImageBackground = true;
              }

              return (
                <Card
                  key={benefit.id}
                  className={cn(
                    'group border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden',
                    !hasImageBackground && cardBgClass,
                    !hasImageBackground && 'card-bg-animated card-bg-gradient card-bg-particles',
                    benefit.size === 'large' ? 'md:col-span-2 p-8' : (benefit.id === 'transparent-pricing' ? 'p-6' : 'p-6')
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
                  {/* Background Image for Transparent Pricing */}
                  {hasImageBackground && (
                    <>
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/for_pt2.png"
                          alt="Transparent Pricing"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/70 via-brand-dark-blue/60 to-brand-dark-blue/70 z-10" />
                    </>
                  )}
                  
                  <CardContent className={cn(
                    "p-0 flex flex-col h-full items-center text-center relative z-10",
                    hasImageBackground && "relative z-20"
                  )}>
                    <div
                      className={cn(
                        'h-1 w-16 mb-4 rounded-full mx-auto',
                        benefit.id === 'personal-connection'
                          ? 'bg-emerald-600'
                          : (hasImageBackground ? 'bg-white' : (accentColor === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-dark-blue'))
                      )}
                    />
                    <div 
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 relative z-10',
                      benefit.id === 'personal-connection'
                        ? 'bg-emerald-600/20 text-emerald-700'
                        : (hasImageBackground
                          ? 'bg-white/20 text-white'
                          : (accentColor === 'brand-teal' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-dark-blue/10 text-brand-dark-blue'))
                      )}
                      style={{
                        animation: isVisible && !prefersReducedMotion 
                          ? `iconScaleIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay + 200}ms forwards, iconFloat 4s ease-in-out ${cardDelay + 1200}ms infinite`
                          : 'none',
                        opacity: isVisible ? 1 : 0,
                      }}
                    >
                      <IconComponent 
                        className={cn(
                          "h-6 w-6 transition-all duration-300 relative z-10",
                          isVisible && !prefersReducedMotion && "icon-pulse-glow"
                        )} 
                        aria-hidden="true" 
                      />
                    </div>
                    <h3 
                      className={cn(
                        "text-xl font-bold mb-3 relative z-10",
                        isVisible && !prefersReducedMotion && "text-glow-animated",
                      (hasImageBackground || benefit.id === 'personal-connection')
                        ? (hasImageBackground ? "text-white" : "text-emerald-700")
                        : "text-brand-dark-blue"
                      )}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay + 300}ms`
                          : `opacity 0.6s ease-out ${cardDelay + 300}ms, transform 0.6s ease-out ${cardDelay + 300}ms`,
                        animation: isVisible && !prefersReducedMotion 
                          ? `textRevealGlow 0.8s ease-out ${cardDelay + 300}ms forwards`
                          : 'none',
                      }}
                    >
                      {benefit.title}
                    </h3>
                    <p 
                      className={cn(
                        'mb-4 flex-grow text-base relative z-10',
                      hasImageBackground
                        ? 'text-white/90'
                        : (benefit.id === 'personal-connection' ? 'text-emerald-800' : 'text-gray-700')
                      )}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay + 500}ms`
                          : `opacity 0.8s ease-out ${cardDelay + 500}ms, transform 0.8s ease-out ${cardDelay + 500}ms`,
                        animation: isVisible && !prefersReducedMotion 
                          ? `textRevealGlow 1s ease-out ${cardDelay + 500}ms forwards`
                          : 'none',
                      }}
                    >
                      {benefit.description}
                    </p>
                    {benefit.link && benefit.linkText && (
                      <div className="mt-auto">
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            'p-0 h-auto text-sm font-semibold hover:underline',
                            hasImageBackground
                              ? 'text-white hover:text-white/80'
                              : (benefit.id === 'personal-connection'
                                ? 'text-emerald-700 hover:text-emerald-700/80'
                                : (accentColor === 'brand-teal' ? 'text-brand-teal hover:text-brand-teal/80' : 'text-brand-dark-blue hover:text-brand-dark-blue/80'))
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
            {patientBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 100;
              const accentColor = benefit.accentColor === 'teal' ? 'brand-teal' : 'brand-dark-blue';

              // Add colored backgrounds to specific cards
              let cardBgClass = 'bg-white';
              let hasImageBackground = false;
              if (benefit.id === 'top-rated') {
                cardBgClass = 'bg-gradient-to-br from-brand-dark-blue/10 via-brand-dark-blue/5 to-brand-dark-blue/10';
              } else if (benefit.id === 'personal-connection') {
                cardBgClass = 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-500/20';
              } else if (benefit.id === 'transparent-pricing') {
                hasImageBackground = true;
              }

              return (
                <Card
                  key={benefit.id}
                  className={cn(
                    'group border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden',
                    !hasImageBackground && cardBgClass,
                    benefit.id === 'transparent-pricing' ? 'p-5' : 'p-6'
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
                  {/* Background Image for Transparent Pricing */}
                  {hasImageBackground && (
                    <>
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/for_pt2.png"
                          alt="Transparent Pricing"
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
                        benefit.id === 'personal-connection'
                          ? 'bg-emerald-600'
                          : (hasImageBackground ? 'bg-white' : (accentColor === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-dark-blue'))
                      )}
                    />
                    <div 
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110',
                      benefit.id === 'personal-connection'
                        ? 'bg-emerald-600/20 text-emerald-700'
                        : (hasImageBackground
                          ? 'bg-white/20 text-white'
                          : (accentColor === 'brand-teal' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-dark-blue/10 text-brand-dark-blue'))
                      )}
                      style={{
                        animation: isVisible && !prefersReducedMotion 
                          ? `iconScaleIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay + 200}ms forwards, iconFloat 4s ease-in-out ${cardDelay + 1200}ms infinite`
                          : 'none',
                        opacity: isVisible ? 1 : 0,
                      }}
                    >
                      <IconComponent 
                        className="h-6 w-6 transition-all duration-300" 
                        aria-hidden="true" 
                      />
                    </div>
                    <h3 
                      className={cn(
                      "text-xl font-bold mb-3",
                      (hasImageBackground || benefit.id === 'personal-connection')
                        ? (hasImageBackground ? "text-white" : "text-emerald-700")
                        : "text-brand-dark-blue"
                      )}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay + 300}ms`
                          : `opacity 0.6s ease-out ${cardDelay + 300}ms, transform 0.6s ease-out ${cardDelay + 300}ms`,
                      }}
                    >
                      {benefit.title}
                    </h3>
                    <p 
                      className={cn(
                      'mb-4 text-base',
                      hasImageBackground
                        ? 'text-white/90'
                        : (benefit.id === 'personal-connection' ? 'text-emerald-800' : 'text-gray-700')
                      )}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(10px)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay + 500}ms`
                          : `opacity 0.8s ease-out ${cardDelay + 500}ms, transform 0.8s ease-out ${cardDelay + 500}ms`,
                      }}
                    >
                      {benefit.description}
                    </p>
                    {benefit.link && benefit.linkText && (
                      <div className="mt-auto">
                        <Button
                          asChild
                          variant="ghost"
                          className={cn(
                            'p-0 h-auto text-sm font-semibold hover:underline',
                            hasImageBackground
                              ? 'text-white hover:text-white/80'
                              : (benefit.id === 'personal-connection'
                                ? 'text-emerald-700 hover:text-emerald-700/80'
                                : (accentColor === 'brand-teal' ? 'text-brand-teal hover:text-brand-teal/80' : 'text-brand-dark-blue hover:text-brand-dark-blue/80'))
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
