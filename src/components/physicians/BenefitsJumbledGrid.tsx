'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
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
  const [visibleCards, setVisibleCards] = useState<boolean[]>(() => Array(physicianBenefits.length).fill(false));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Per-card viewport: each card animates when it scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const indexStr = (entry.target as HTMLElement).getAttribute('data-card-index');
          if (indexStr == null || !entry.isIntersecting) return;
          const index = parseInt(indexStr, 10);
          setVisibleCards((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
          });
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const getIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconMap[iconName] || 'Handshake'] as React.ComponentType<{ className?: string }>;
    return IconComponent || Handshake;
  };

  /** Wrap keywords in description with bold + animated span */
  const renderDescriptionWithKeywords = (
    text: string,
    keywords: string[] | undefined,
    keywordClassName: string
  ): ReactNode => {
    if (!keywords?.length) return text;
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    const escaped = sorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(pattern);
    return parts.map((part, i) => {
      const isKeyword = sorted.some((k) => part.toLowerCase() === k.toLowerCase());
      if (isKeyword) {
        return (
          <span key={i} className={keywordClassName}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <section
      ref={sectionRef}
      className="pt-16 md:pt-24 pb-10 md:pb-14 relative overflow-hidden bg-white"
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

          {/* Desktop: staggered layout – wide cards + animated numbers in empty space */}
          <div className="hidden lg:flex lg:flex-col lg:gap-6">
            {physicianBenefits.map((benefit, index) => {
              const IconComponent = getIcon(benefit.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 150;
              const isLarge = benefit.size === 'large';
              const accentColor = benefit.accentColor === 'blue' ? 'brand-dark-blue' : 'emerald-600';

              // Card on left for 0,2 → number on right (1, 3). Card on right for 1,3 → number on left (2, 4).
              const cardOnLeft = index % 2 === 0;
              const alignClass = cardOnLeft ? 'lg:self-start' : 'lg:self-end';

              // Card style: standard glass (contact-style) for white/emerald; keep dark/image for special cards
              const isDarkCard = benefit.id === 'collective-bargaining' || benefit.id === 'clinical-autonomy';
              const hasImageBackground = benefit.id === 'clinical-autonomy';
              const isStandardGlass = !isDarkCard && !hasImageBackground;

              // Slide in from left for even cards, from right for odd cards (per-card viewport)
              const cardVisible = visibleCards[index];
              const slideX = cardOnLeft ? '-120px' : '120px';
              const transformIn = 'translateX(0) translateY(0) scale(1)';
              const transformOut = prefersReducedMotion
                ? 'translateY(20px) scale(0.98)'
                : `translateX(${slideX}) translateY(20px) scale(0.98)`;

              // Number color matches the card: dark cards → white; glass cards → accent (blue or green)
              const numberColorClass = isDarkCard
                ? 'text-white/25'
                : accentColor === 'blue'
                  ? 'text-brand-dark-blue/25'
                  : 'text-emerald-600/25';

              const numberEl = (
                <div
                  className={cn(
                    'flex items-center min-h-[140px] flex-1 min-w-0',
                    cardOnLeft ? 'justify-end pr-4' : 'justify-start pl-4'
                  )}
                  style={{
                    order: cardOnLeft ? 2 : 1,
                    opacity: cardVisible ? 1 : 0,
                    transform: cardVisible && !prefersReducedMotion ? 'scale(1)' : 'scale(0.3)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${cardDelay}ms`
                      : `opacity 0.6s ease-out ${cardDelay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${cardDelay}ms`,
                  }}
                  aria-hidden
                >
                  <span className={cn('text-[6rem] md:text-[7rem] font-black leading-none select-none tabular-nums', numberColorClass)}>
                    {index + 1}
                  </span>
                </div>
              );

              return (
                <div key={benefit.id} className="w-full flex flex-row justify-between items-stretch gap-2 min-h-[140px]">
                  <div
                    ref={(el) => { cardRefs.current[index] = el; }}
                    data-card-index={index}
                    style={{
                      order: cardOnLeft ? 1 : 2,
                      opacity: cardVisible ? 1 : 0,
                      transform: cardVisible && !prefersReducedMotion ? transformIn : transformOut,
                      transition: prefersReducedMotion
                        ? `opacity 0.3s ease ${cardDelay}ms`
                        : `opacity 0.7s ease-out ${cardDelay}ms, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${cardDelay}ms`,
                    }}
                    className="h-full w-[88%] min-h-0 lg:min-h-[140px] shrink-0"
                  >
                  <Card
                    className={cn(
                      'group relative overflow-hidden h-full transition-all duration-500 ease-out data-scroll-exclude',
                      'hover:-translate-y-2 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.01]',
                      isStandardGlass &&
                        'bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-1 shadow-2xl shadow-black/15 hover:bg-white/75',
                      isDarkCard && !hasImageBackground && 'bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90 border border-white/20 hover:border-brand-teal/60',
                      hasImageBackground && 'border border-white/20',
                      'py-4 px-5 md:py-5 md:px-8'
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
                      "p-0 flex flex-row h-full items-center gap-4 md:gap-6 text-left",
                      (hasImageBackground || isDarkCard) && "relative z-20"
                    )}>
                      {/* Left: icon (compact for bar) */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={cn(
                            'h-0.5 w-8 rounded-full mb-2',
                            isDarkCard ? 'bg-white' : 'bg-emerald-600'
                          )}
                          aria-hidden
                        />
                        <div
                          className={cn(
                            'w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(15,95,168,0.4)]',
                            isDarkCard ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-brand-dark-blue to-brand-teal text-white',
                            isStandardGlass && isVisible && !prefersReducedMotion && 'pulsate-bck-normal'
                          )}
                        >
                          {isStandardGlass && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                          )}
                          <IconComponent className={cn('text-white relative z-10', 'h-7 w-7 md:h-8 md:w-8')} aria-hidden="true" />
                        </div>
                      </div>

                      {/* Right: title, description, link (single line / compact) */}
                      <div className="flex flex-col justify-center min-w-0 flex-1 py-1">
                        <h3 className={cn(
                          "text-lg md:text-xl font-extrabold mb-0.5 tracking-tight leading-tight",
                          isDarkCard ? "text-white" : "text-brand-dark-blue"
                        )}>
                          {benefit.title}
                        </h3>
                        <p className={cn(
                          'text-sm md:text-base',
                          isDarkCard ? 'text-white/90' : 'text-gray-700',
                          'leading-snug line-clamp-2'
                        )}>
                          {renderDescriptionWithKeywords(
                            benefit.description,
                            benefit.keywords,
                            cn(
                              'font-bold benefits-description-keyword',
                              isDarkCard ? 'text-white' : 'text-brand-dark-blue'
                            )
                          )}
                        </p>
                        {benefit.link && benefit.linkText && (
                          <div className="mt-1.5">
                            <Button
                              asChild
                              variant="ghost"
                              className={cn(
                                'p-0 h-auto text-xs md:text-sm font-semibold hover:underline',
                                isDarkCard ? 'text-white hover:text-white/80' : 'text-emerald-600 hover:text-emerald-600/80'
                              )}
                            >
                              <Link href={benefit.link}>
                                {benefit.linkText}
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                  </CardContent>
                </Card>
                  </div>
                  {numberEl}
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
                      <h3 className={cn("text-xl md:text-2xl font-extrabold mb-3 tracking-tight leading-tight", isDarkCard ? "text-white" : "text-brand-dark-blue")}>{benefit.title}</h3>
                      <p className={cn('mb-4 flex-grow text-base', isDarkCard ? 'text-white/90' : 'text-gray-700')}>
                        {renderDescriptionWithKeywords(
                          benefit.description,
                          benefit.keywords,
                          cn('font-bold benefits-description-keyword', isDarkCard ? 'text-white' : 'text-brand-dark-blue')
                        )}
                      </p>
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
                      <h3 className={cn("text-xl md:text-2xl font-extrabold mb-3 tracking-tight leading-tight", isDarkCard ? "text-white" : "text-brand-dark-blue")}>{benefit.title}</h3>
                      <p className={cn('mb-4 text-base', isDarkCard ? 'text-white/90' : 'text-gray-700')}>
                        {renderDescriptionWithKeywords(
                          benefit.description,
                          benefit.keywords,
                          cn('font-bold benefits-description-keyword', isDarkCard ? 'text-white' : 'text-brand-dark-blue')
                        )}
                      </p>
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
              className="bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg font-semibold hover:scale-105"
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
