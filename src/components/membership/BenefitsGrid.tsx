'use client';

import { useEffect, useRef, useState } from 'react';
import { membershipBenefits } from '@/data/membershipBenefits';
import { BenefitCard } from './BenefitCard';
import { Card, CardContent } from '@/components/ui/card';

export function BenefitsGrid() {
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

  return (
    <section ref={sectionRef} id="benefits" className="py-16 md:py-24 skin-benefits-enhanced">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl lg:text-3xl font-bold text-brand-dark-blue mb-4"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            Membership Benefits
          </h2>
          <p 
            className="text-lg text-gray-700"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.3s, transform 0.7s ease-out 0.3s',
            }}
          >
            Join the Alliance to access comprehensive resources and tools designed to help independent physicians thrive.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {membershipBenefits.map((benefit, index) => {
            const delay = prefersReducedMotion ? 0 : index * 200;
            return (
              <div
                key={benefit.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? 'translateY(0) scale(1)' 
                    : 'translateY(30px) scale(0.95)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${delay}ms`
                    : `opacity 0.7s ease-out ${0.4 + delay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.4 + delay}ms`,
                }}
              >
                <BenefitCard benefit={benefit} />
              </div>
            );
          })}
        </div>

        {/* Who membership is for */}
        <Card 
          className="max-w-3xl mx-auto border-2 border-brand-teal/20 bg-white hover:border-brand-teal/40 transition-all duration-300 hover-lift shadow-lg"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 1.2s, transform 1.5s ease-out 1.2s',
          }}
        >
          <CardContent className="p-6 md:p-8">
            <h3 className="text-2xl font-semibold text-brand-dark-blue mb-4">
              Who Membership Is For
            </h3>
            <ul className="space-y-3 text-gray-700">
              {[
                'Independent physicians seeking to expand their referral network and patient base',
                'Group practices looking to enhance their online presence and streamline operations',
                'Allied healthcare providers (Nurse Practitioners, Physician Assistants) wanting to connect with the physician community',
              ].map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 transition-all duration-300 hover:translate-x-2"
                >
                  <span className="text-brand-teal font-bold mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
