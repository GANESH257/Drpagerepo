'use client';

import { useEffect, useState, useRef } from 'react';
import { impactStats } from '@/data/physiciansPage';
import { Users, DollarSign, Calendar, Heart, Stethoscope, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, keyof typeof LucideIcons> = {
  Users: 'Users',
  DollarSign: 'DollarSign',
  Calendar: 'Calendar',
  Heart: 'Heart',
  Stethoscope: 'Stethoscope',
  Award: 'Award',
};

export function ImpactStats() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({});
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

  // Animate stats counter
  useEffect(() => {
    if (!isVisible) return;

    const timers: NodeJS.Timeout[] = [];

    if (!prefersReducedMotion) {
      impactStats.forEach((stat) => {
        // Parse numeric value from strings like "2,500+", "$50M+", "15+", "500k+"
        let numericValue = 0;
        let suffix = '';
        const valueStr = stat.value.replace(/,/g, ''); // Remove commas
        
        if (valueStr.includes('$')) {
          // Handle currency: $50M+ -> 50000000
          const numPart = valueStr.replace('$', '').replace('+', '');
          if (numPart.includes('M')) {
            numericValue = parseFloat(numPart.replace('M', '')) * 1000000;
            suffix = 'M+';
          } else if (numPart.includes('k')) {
            numericValue = parseFloat(numPart.replace('k', '')) * 1000;
            suffix = 'k+';
          } else {
            numericValue = parseFloat(numPart);
            suffix = '+';
          }
        } else if (valueStr.includes('k')) {
          // Handle k: 500k+ -> 500000
          numericValue = parseFloat(valueStr.replace('k', '').replace('+', '')) * 1000;
          suffix = 'k+';
        } else if (valueStr.includes('M')) {
          // Handle M: 50M+ -> 50000000
          numericValue = parseFloat(valueStr.replace('M', '').replace('+', '')) * 1000000;
          suffix = 'M+';
        } else {
          // Handle regular numbers: 2,500+ -> 2500
          numericValue = parseInt(valueStr.replace('+', '')) || 0;
          suffix = '+';
        }

        if (numericValue > 0) {
          const duration = 2000;
          const steps = 60;
          const increment = numericValue / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
              setAnimatedStats(prev => ({ ...prev, [stat.id]: numericValue }));
              clearInterval(timer);
            } else {
              setAnimatedStats(prev => ({ ...prev, [stat.id]: Math.floor(current) }));
            }
          }, duration / steps);
          timers.push(timer);
        } else {
          setAnimatedStats(prev => ({ ...prev, [stat.id]: 0 }));
        }
      });
    } else {
      // Set final values immediately if reduced motion
      const finalStats: Record<string, number> = {};
      impactStats.forEach((stat) => {
        const valueStr = stat.value.replace(/,/g, '');
        let numericValue = 0;
        
        if (valueStr.includes('$')) {
          const numPart = valueStr.replace('$', '').replace('+', '');
          if (numPart.includes('M')) {
            numericValue = parseFloat(numPart.replace('M', '')) * 1000000;
          } else if (numPart.includes('k')) {
            numericValue = parseFloat(numPart.replace('k', '')) * 1000;
          } else {
            numericValue = parseFloat(numPart);
          }
        } else if (valueStr.includes('k')) {
          numericValue = parseFloat(valueStr.replace('k', '').replace('+', '')) * 1000;
        } else if (valueStr.includes('M')) {
          numericValue = parseFloat(valueStr.replace('M', '').replace('+', '')) * 1000000;
        } else {
          numericValue = parseInt(valueStr.replace('+', '')) || 0;
        }
        finalStats[stat.id] = numericValue;
      });
      setAnimatedStats(finalStats);
    }

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [isVisible, prefersReducedMotion]);

  const getIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconMap[iconName] || 'Users'] as React.ComponentType<{ className?: string }>;
    return IconComponent || Users;
  };

  const formatStatValue = (stat: typeof impactStats[0], animatedValue: number) => {
    const valueStr = stat.value.replace(/,/g, '');
    
    if (valueStr.includes('$')) {
      // Currency formatting
      if (valueStr.includes('M')) {
        return `$${Math.floor(animatedValue / 1000000)}M+`;
      } else if (valueStr.includes('k')) {
        return `$${Math.floor(animatedValue / 1000)}k+`;
      } else {
        return `$${animatedValue.toLocaleString()}+`;
      }
    } else if (valueStr.includes('k')) {
      // k formatting: 500k+
      return `${Math.floor(animatedValue / 1000)}k+`;
    } else if (valueStr.includes('M')) {
      // M formatting: 50M+
      return `${Math.floor(animatedValue / 1000000)}M+`;
    } else {
      // Regular number with comma formatting: 2,500+
      return `${animatedValue.toLocaleString()}+`;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-dark-blue/90"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {impactStats.map((stat, index) => {
              const IconComponent = getIcon(stat.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 80;

              return (
                <div
                  key={stat.id}
                  style={
                    prefersReducedMotion
                      ? {
                          opacity: isVisible ? 1 : 0,
                          transition: `opacity 0.3s ease ${cardDelay}ms`,
                        }
                      : {
                          opacity: 0,
                          animation: isVisible
                            ? `slideInUpBounce 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms forwards`
                            : 'none',
                        }
                  }
                  className="h-full"
                >
                  <div
                    className={cn(
                      'group flex flex-col items-center text-center rounded-2xl px-6 py-8 md:px-8 md:py-10 relative overflow-hidden h-full transition-all duration-500 ease-out data-scroll-exclude',
                      'bg-white/10 backdrop-blur-xl border border-white/20 -translate-y-3 shadow-2xl shadow-black/20',
                      'hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(45,212,191,0.3)] hover:border-brand-teal/60 hover:scale-[1.02] hover:bg-white/20'
                    )}
                  >
                    {/* Standard card layers (same as Contact/Benefits) – adapted for dark section */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-brand-teal/10 pointer-events-none group-hover:opacity-80 transition-opacity duration-500" aria-hidden />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/5 via-transparent to-brand-dark-blue/5 pointer-events-none" aria-hidden />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/15 via-white/5 to-brand-teal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden />
                    <div className="absolute inset-0 pointer-events-none" aria-hidden>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/10 via-white/5 to-transparent animate-gradient-shift" />
                      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-brand-teal/5 to-white/10 animate-gradient-shift-reverse" />
                    </div>
                    <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500" aria-hidden>
                      <div className="absolute inset-0 floating" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-teal/15 group-hover:bg-brand-teal/30 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500" aria-hidden />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-teal/10 group-hover:bg-brand-teal/25 group-hover:scale-150 rounded-full blur-3xl pointer-events-none transition-all duration-500" aria-hidden />

                    <div
                      className="relative z-10 flex flex-col items-center text-center w-full"
                      style={
                        prefersReducedMotion
                          ? undefined
                          : {
                              opacity: isVisible ? 1 : 0,
                              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                              transition: `opacity 0.5s ease ${cardDelay + 180}ms, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay + 180}ms`,
                            }
                      }
                    >
                      {/* Standard icon – same as Contact: large gradient box, pulsate, hover scale/glow */}
                      <div
                        className={cn(
                          'w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl text-white relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.45)]',
                          'bg-gradient-to-br from-brand-dark-blue to-brand-teal',
                          isVisible && !prefersReducedMotion && 'pulsate-bck-normal'
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                        <IconComponent className="h-12 w-12 relative z-10" aria-hidden="true" />
                      </div>
                      <div className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-white mb-2 tabular-nums tracking-tight transition-colors duration-300 group-hover:text-white">
                        {animatedStats[stat.id] !== undefined
                          ? formatStatValue(stat, animatedStats[stat.id])
                          : stat.value
                        }
                      </div>
                      <div className="text-sm md:text-base text-white/90 font-medium leading-snug transition-colors duration-300 group-hover:text-white">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
