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
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {impactStats.map((stat, index) => {
              const IconComponent = getIcon(stat.icon);
              const cardDelay = prefersReducedMotion ? 0 : index * 100;

              return (
                <div
                  key={stat.id}
                  className="flex flex-col items-center text-center"
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white/20 text-white">
                    <IconComponent className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {animatedStats[stat.id] !== undefined 
                      ? formatStatValue(stat, animatedStats[stat.id])
                      : stat.value
                    }
                  </div>
                  <div className="text-sm md:text-base text-white/90 font-medium">
                    {stat.label}
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
