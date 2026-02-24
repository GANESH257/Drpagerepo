'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Playfair_Display } from 'next/font/google';
import { membershipPlans } from '@/data/membershipPlans';
import { PlanCard } from './PlanCard';
import { Switch } from '@/components/ui/switch';
import { PlanComparisonTable } from './PlanComparisonTable';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

export function PlansSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleBillingChange = useCallback((checked: boolean) => {
    setBillingPeriod(checked ? 'annual' : 'monthly');
  }, []);

  return (
    <section ref={sectionRef} id="plans" className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-emerald-50/80 to-teal-50/60">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* Header – same text design as Mission-style */}
          <div
            className="mb-8 md:mb-10"
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
              Plans
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
              Membership{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">
                Plans
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose the plan that best fits your practice needs. All plans include core features with additional benefits at higher tiers.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`cursor-pointer transition-colors ${billingPeriod === 'monthly' ? 'font-semibold text-brand-dark-blue' : 'text-gray-600'}`}
            >
              Monthly
            </button>
            <Switch
              id="billing-toggle"
              checked={billingPeriod === 'annual'}
              onCheckedChange={handleBillingChange}
              aria-label="Toggle billing period"
            />
            <button
              type="button"
              onClick={() => setBillingPeriod('annual')}
              className={`cursor-pointer transition-colors ${billingPeriod === 'annual' ? 'font-semibold text-brand-dark-blue' : 'text-gray-600'}`}
            >
              Annual
            </button>
            {billingPeriod === 'annual' && (
              <span className="text-sm text-brand-teal font-medium ml-2">
                (Save 2 months)
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {membershipPlans.map((plan, index) => {
            const delay = prefersReducedMotion ? 0 : index * 100;
            return (
              <div
                key={plan.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? 'translateY(0) scale(1)' 
                    : 'translateY(30px) scale(0.95)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${delay}ms`
                    : `opacity 1.8s ease-out ${800 + delay}ms, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${800 + delay}ms`,
                }}
              >
                <PlanCard plan={plan} billingCycle={billingPeriod} />
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <PlanComparisonTable plans={membershipPlans} />
      </div>
    </section>
  );
}
