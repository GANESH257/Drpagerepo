'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display } from 'next/font/google';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { physicianBenefits } from '@/data/physiciansPage';
import { Handshake, TrendingDown, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const iconMap: Record<string, keyof typeof LucideIcons> = {
  Handshake: 'Handshake',
  TrendingDown: 'TrendingDown',
  Users: 'Users',
  ShieldCheck: 'ShieldCheck',
  Briefcase: 'Briefcase',
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
          {/* Section Header – same text design as MissionStatementNewHome */}
          <div
            className="text-center mb-8 md:mb-10"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              className={cn(
                'inline-block px-4 py-1.5 bg-brand-dark-blue/10 text-brand-dark-blue font-black text-base md:text-lg uppercase tracking-[0.2em] rounded-full mb-4 border border-brand-dark-blue/20',
                playfairDisplay.className
              )}
            >
              For Physicians
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
              Empower <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">Your Practice</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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

              // Card style: standard glass (contact-style) for white/emerald; keep dark/image for special cards
              const isDarkCard = benefit.id === 'collective-bargaining' || benefit.id === 'clinical-autonomy';
              const hasImageBackground = benefit.id === 'clinical-autonomy';
              const isStandardGlass = !isDarkCard && !hasImageBackground;

              return (
                <div
                  key={benefit.id}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion
                      ? 'translateY(0) scale(1)'
                      : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${cardDelay}ms`
                      : `opacity 0.8s ease-out ${cardDelay}ms, transform 0.8s ease-out ${cardDelay}ms`,
                  }}
                  className={cn('h-full', gridClass)}
                >
                  <Card
                    className={cn(
                      'group relative overflow-hidden h-full transition-all duration-500 ease-out data-scroll-exclude',
                      'hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02]',
                      isStandardGlass &&
                        'bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:bg-white/75',
                      isDarkCard && !hasImageBackground && 'bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90 border border-white/20 hover:border-brand-teal/60',
                      hasImageBackground && 'border border-white/20',
                      isLarge ? 'p-8' : 'p-6'
                    )}
                  >
                    {/* Standard glass cards: same decorative layers as ContactInfoCards */}
                    {isStandardGlass && (
                      <>
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
                      </>
                    )}
                    {/* Dark cards: subtle orbs on hover */}
                    {isDarkCard && (
                      <>
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-teal/20 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 z-0" aria-hidden />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-teal/15 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 z-0" aria-hidden />
                      </>
                    )}

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
                      "p-0 flex flex-col h-full items-center text-center",
                      (hasImageBackground || isDarkCard) && "relative z-20"
                    )}>
                      {/* Top accent line */}
                      <div
                        className={cn(
                          'h-1 w-16 mb-4 rounded-full',
                          isDarkCard ? 'bg-white' : 'bg-emerald-600'
                        )}
                      />

                      {/* Standard icon – same as Contact cards: large gradient box, pulsate, hover scale/glow */}
                      <div
                        className={cn(
                          'w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)]',
                          isDarkCard ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-brand-dark-blue to-brand-teal text-white',
                          isStandardGlass && isVisible && !prefersReducedMotion && 'pulsate-bck-normal'
                        )}
                      >
                        {isStandardGlass && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                        )}
                        <IconComponent className={cn('text-white relative z-10', isStandardGlass ? 'h-12 w-12' : 'h-10 w-10')} aria-hidden="true" />
                      </div>

                    {/* Title */}
                    <h3 className={cn(
                      "text-xl md:text-2xl font-bold mb-3",
                      isDarkCard ? "text-white" : "text-brand-dark-blue"
                    )}>
                      {benefit.title}
                    </h3>

                    {/* Description */}
                    <p className={cn(
                      'mb-4 flex-grow',
                      isDarkCard ? 'text-white/90' : 'text-gray-700',
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
                            isDarkCard ? 'text-white hover:text-white/80' : 'text-emerald-600 hover:text-emerald-600/80'
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
                </div>
              );
            })}
          </div>

          {/* Tablet: 2-column staggered grid – same standard card design */}
          <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6">
            {physicianBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 150;
              const isDarkCard = benefit.id === 'collective-bargaining' || benefit.id === 'clinical-autonomy';
              const hasImageBackground = benefit.id === 'clinical-autonomy';
              const isStandardGlass = !isDarkCard && !hasImageBackground;

              return (
                <div
                  key={benefit.id}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion ? `opacity 0.3s ease ${cardDelay}ms` : `opacity 0.8s ease-out ${cardDelay}ms, transform 0.8s ease-out ${cardDelay}ms`,
                  }}
                  className={benefit.size === 'large' ? 'md:col-span-2 h-full' : 'h-full'}
                >
                  <Card
                    className={cn(
                      'group relative overflow-hidden h-full transition-all duration-500 ease-out data-scroll-exclude',
                      'hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02]',
                      isStandardGlass && 'bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:bg-white/75',
                      isDarkCard && !hasImageBackground && 'bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90 border border-white/20 hover:border-brand-teal/60',
                      hasImageBackground && 'border border-white/20',
                      benefit.size === 'large' ? 'p-8' : 'p-6'
                    )}
                  >
                    {isStandardGlass && (
                      <>
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
                      </>
                    )}
                    {isDarkCard && (
                      <>
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-teal/20 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 z-0" aria-hidden />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-teal/15 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 z-0" aria-hidden />
                      </>
                    )}
                    {hasImageBackground && (
                      <>
                        <div className="absolute inset-0 z-0">
                          <Image src="/for_dr2.png" alt="Total Clinical Autonomy" fill className="object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/70 via-brand-dark-blue/60 to-brand-dark-blue/70 z-10" />
                      </>
                    )}
                    <CardContent className={cn("p-0 flex flex-col h-full items-center text-center", (hasImageBackground || isDarkCard) && "relative z-20")}>
                      <div className={cn('h-1 w-16 mb-4 rounded-full', isDarkCard ? 'bg-white' : 'bg-emerald-600')} />
                      <div className={cn(
                        'w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)]',
                        isDarkCard ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-brand-dark-blue to-brand-teal text-white',
                        isStandardGlass && isVisible && !prefersReducedMotion && 'pulsate-bck-normal'
                      )}>
                        {isStandardGlass && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />}
                        <IconComponent className={cn('text-white relative z-10', isStandardGlass ? 'h-12 w-12' : 'h-10 w-10')} aria-hidden="true" />
                      </div>
                      <h3 className={cn("text-xl font-bold mb-3", isDarkCard ? "text-white" : "text-brand-dark-blue")}>{benefit.title}</h3>
                      <p className={cn('mb-4 flex-grow text-base', isDarkCard ? 'text-white/90' : 'text-gray-700')}>{benefit.description}</p>
                      {benefit.link && benefit.linkText && (
                        <div className="mt-auto">
                          <Button asChild variant="ghost" className={cn('p-0 h-auto text-sm font-semibold hover:underline', isDarkCard ? 'text-white hover:text-white/80' : 'text-emerald-600 hover:text-emerald-600/80')}>
                            <Link href={benefit.link}>{benefit.linkText}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
                          </Button>
                        </div>
                      )}
                  </CardContent>
                </Card>
                </div>
              );
            })}
          </div>

          {/* Mobile: Single column stack – same standard card design */}
          <div className="grid grid-cols-1 md:hidden gap-6">
            {physicianBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 100;
              const isDarkCard = benefit.id === 'collective-bargaining' || benefit.id === 'clinical-autonomy';
              const hasImageBackground = benefit.id === 'clinical-autonomy';
              const isStandardGlass = !isDarkCard && !hasImageBackground;

              return (
                <div
                  key={benefit.id}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion ? `opacity 0.3s ease ${cardDelay}ms` : `opacity 0.8s ease-out ${cardDelay}ms, transform 0.8s ease-out ${cardDelay}ms`,
                  }}
                  className="h-full"
                >
                  <Card
                    className={cn(
                      'group relative overflow-hidden h-full p-6 transition-all duration-500 ease-out data-scroll-exclude',
                      'hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02]',
                      isStandardGlass && 'bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:bg-white/75',
                      isDarkCard && !hasImageBackground && 'bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90 border border-white/20 hover:border-brand-teal/60',
                      hasImageBackground && 'border border-white/20'
                    )}
                  >
                    {isStandardGlass && (
                      <>
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
                      </>
                    )}
                    {isDarkCard && (
                      <>
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-teal/20 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 z-0" aria-hidden />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-teal/15 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 z-0" aria-hidden />
                      </>
                    )}
                    {hasImageBackground && (
                      <>
                        <div className="absolute inset-0 z-0">
                          <Image src="/for_dr2.png" alt="Total Clinical Autonomy" fill className="object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/70 via-brand-dark-blue/60 to-brand-dark-blue/70 z-10" />
                      </>
                    )}
                    <CardContent className={cn("p-0 flex flex-col items-center text-center", (hasImageBackground || isDarkCard) && "relative z-20")}>
                      <div className={cn('h-1 w-16 mb-4 rounded-full', isDarkCard ? 'bg-white' : 'bg-emerald-600')} />
                      <div className={cn(
                        'w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)]',
                        isDarkCard ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-brand-dark-blue to-brand-teal text-white',
                        isStandardGlass && isVisible && !prefersReducedMotion && 'pulsate-bck-normal'
                      )}>
                        {isStandardGlass && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />}
                        <IconComponent className={cn('text-white relative z-10', isStandardGlass ? 'h-12 w-12' : 'h-10 w-10')} aria-hidden="true" />
                      </div>
                      <h3 className={cn("text-xl font-bold mb-3", isDarkCard ? "text-white" : "text-brand-dark-blue")}>{benefit.title}</h3>
                      <p className={cn('mb-4 text-base', isDarkCard ? 'text-white/90' : 'text-gray-700')}>{benefit.description}</p>
                      {benefit.link && benefit.linkText && (
                        <div className="mt-auto">
                          <Button asChild variant="ghost" className={cn('p-0 h-auto text-sm font-semibold hover:underline', isDarkCard ? 'text-white hover:text-white/80' : 'text-emerald-600 hover:text-emerald-600/80')}>
                            <Link href={benefit.link}>{benefit.linkText}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
                          </Button>
                        </div>
                      )}
                  </CardContent>
                </Card>
                </div>
              );
            })}
          </div>

          {/* Join Now CTA Button */}
          <div
            className="text-center mt-12 md:mt-16"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 1s, transform 0.8s ease-out 1s',
            }}
          >
            <Button
              asChild
              size="lg"
              className="bg-brand-teal hover:bg-brand-teal/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg font-semibold"
            >
              <Link href="/membership">
                View Membership Plans
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
