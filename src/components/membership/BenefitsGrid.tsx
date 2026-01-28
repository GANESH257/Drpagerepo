'use client';

import { useEffect, useRef, useState } from 'react';
import { membershipBenefits } from '@/data/membershipBenefits';
import { Card, CardContent } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';

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
      id="benefits"
      className="py-16 md:py-24 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/90 to-brand-teal/20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-brand-teal tracking-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            Member Benefits
          </h2>
          <p
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.7s ease-out 0.3s, transform 0.7s ease-out 0.3s',
            }}
          >
            Join the Alliance network to access resources, referrals, visibility, and community. Connect with independent physicians and grow your practice.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="w-full max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {membershipBenefits.map((benefit, idx) => {
              const IconName = benefit.icon as keyof typeof LucideIcons;
              const IconComponent = LucideIcons[IconName] as React.ComponentType<{ className?: string }> || LucideIcons.HelpCircle;
              const delay = prefersReducedMotion ? 0 : idx * 100;
              return (
                <div
                  key={benefit.id}
                  className="bg-card rounded-2xl border border-brand-teal/30 shadow-[0_8px_32px_0_rgba(46,196,182,0.12),0_1.5px_6px_0_rgba(26,75,127,0.10)] p-6 flex flex-col gap-2 transition-all duration-700 h-full cursor-pointer group hover:scale-[1.04] hover:shadow-[0_16px_48px_0_rgba(46,196,182,0.22),0_3px_12px_0_rgba(26,75,127,0.18)] hover:border-brand-teal hover:bg-brand-teal/5"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${delay}ms`
                      : `opacity 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                  }}
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-brand-teal/10 mb-2 group-hover:bg-brand-teal/20 transition-all duration-300">
                    <IconComponent className="h-8 w-8 text-brand-dark-blue group-hover:text-brand-teal transition-all duration-300" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-brand-teal mb-1 group-hover:text-white transition-all duration-300">{benefit.title}</h3>
                  <p className="text-sm md:text-base text-brand-dark-blue-alt/80 leading-relaxed group-hover:text-white transition-all duration-300">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Who membership is for */}
        <div
          className="max-w-4xl mx-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 1.2s, transform 1.5s ease-out 1.2s',
          }}
        >
          <Card className="border-2 border-white/20 bg-white shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-brand-teal/40">
            <CardContent className="p-8 md:p-10">
              <h3 className="text-2xl md:text-3xl font-bold text-brand-dark-blue mb-6">
                Who Membership Is For
              </h3>
              <ul className="space-y-4">
                {[
                  'Independent physicians seeking to expand their referral network and patient base',
                  'Group practices looking to enhance their online presence and streamline operations',
                  'Allied healthcare providers (Nurse Practitioners, Physician Assistants) wanting to connect with the physician community',
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center mt-0.5 group-hover:bg-brand-teal/20 transition-colors duration-300">
                      <span className="text-brand-teal font-bold text-lg">•</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-800 leading-relaxed flex-1 pt-0.5">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
