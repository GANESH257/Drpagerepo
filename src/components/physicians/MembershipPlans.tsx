'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { membershipPlans } from '@/data/physiciansPage';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MembershipPlans() {
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
          observer.disconnect();
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
      id="plans"
      className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-50"
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
              Membership Plans
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {membershipPlans.map((plan, index) => {
              const cardDelay = prefersReducedMotion ? 0 : index * 150;
              const isPopular = plan.badge === 'MOST POPULAR';

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative bg-white border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col',
                    isPopular && 'border-emerald-600 border-2 shadow-lg'
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
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-emerald-600 text-white px-3 py-1">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4 pt-6">
                    <CardTitle className="text-2xl font-bold text-brand-dark-blue mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="text-3xl md:text-4xl font-bold text-brand-dark-blue mb-2">
                      {plan.price}
                    </div>
                    {plan.price !== 'Custom' && (
                      <CardDescription className="text-sm text-gray-600">
                        per month
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="text-sm md:text-base text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      size="lg"
                      className={cn(
                        'w-full',
                        isPopular
                          ? 'bg-gradient-to-r from-brand-dark-blue to-emerald-600 text-white hover:from-brand-dark-blue/90 hover:to-emerald-600/90'
                          : 'bg-brand-dark-blue text-white hover:bg-brand-dark-blue/90'
                      )}
                    >
                      <Link href={plan.ctaHref}>
                        {plan.ctaLabel}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p
            className="text-center text-sm text-gray-600"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.8s',
            }}
          >
            Pricing shown for reference. Final terms may vary by practice.
          </p>
        </div>
      </div>
    </section>
  );
}
