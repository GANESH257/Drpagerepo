'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { memberBenefits } from '@/data/memberBenefits';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export function MemberBenefitsSection() {
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
      id="member-benefits" 
      className="py-16 md:py-24 relative skin-benefits-enhanced overflow-hidden"
    >

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-brand-dark-blue"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            Member Benefits
          </h2>
          <p 
            className="text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.8s, transform 1.5s ease-out 0.8s',
            }}
          >
            Join the Alliance network to access resources, referrals, visibility, and community. Connect with independent physicians and grow your practice.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {memberBenefits.map((benefit, index) => {
            const IconName = benefit.icon as keyof typeof LucideIcons;
            const IconComponent = LucideIcons[IconName] as React.ComponentType<{ className?: string }> || LucideIcons.HelpCircle;
            const cardDelay = prefersReducedMotion ? 0 : index * 300;

            return (
              <Card
                key={benefit.id}
                className="h-full card-vibrant group focus-ring"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? 'translateY(0) scale(1) rotateY(0deg)' 
                    : 'translateY(30px) scale(0.9) rotateY(-5deg)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${cardDelay}ms`
                    : `opacity 1.8s ease-out ${cardDelay}ms, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-teal/10 mb-2 group-hover:bg-brand-teal/20 transition-all duration-300 hover-rotate">
                      <IconComponent className="h-7 w-7 text-brand-dark-blue" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-brand-teal !text-brand-teal">
                      {benefit.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTAs */}
        <div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 1.2s, transform 1.5s ease-out 1.2s',
          }}
        >
          <Button
            asChild
            size="lg"
            variant="gradient"
            className="focus-ring"
          >
            <Link href="/join-us">
              Join Us
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="focus-ring"
          >
            <Link href="/membership">View Membership Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
