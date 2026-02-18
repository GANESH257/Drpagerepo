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

  // Slider logic
  const [slide, setSlide] = useState(0);
  const benefitsPerSlide = 4;
  const totalSlides = Math.ceil(memberBenefits.length / benefitsPerSlide);
  const currentBenefits = memberBenefits.slice(slide * benefitsPerSlide, (slide + 1) * benefitsPerSlide);


  return (
    <section
      ref={sectionRef}
      id="member-benefits"
      className="py-16 md:py-24 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/90 to-brand-teal/20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-teal tracking-tight">Member Benefits</h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
Join the Alliance network to access resources, referrals, visibility, and community. Connect with independent physicians and grow your practice.
          </p>
        </div>

        {/* Slider */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentBenefits.map((benefit, idx) => {
                const IconName = benefit.icon as keyof typeof LucideIcons;
                const IconComponent = LucideIcons[IconName] as React.ComponentType<{ className?: string }> || LucideIcons.HelpCircle;
                return (
                  <div
                    key={benefit.id}
                    className={
                      `bg-card rounded-2xl border border-brand-teal/30 shadow-[0_8px_32px_0_rgba(46,196,182,0.12),0_1.5px_6px_0_rgba(26,75,127,0.10)] p-6 flex flex-col gap-2 transition-all duration-700 animate-in fade-in slide-in-up h-full cursor-pointer group hover:scale-[1.04] hover:shadow-[0_16px_48px_0_rgba(46,196,182,0.22),0_3px_12px_0_rgba(26,75,127,0.18)] hover:border-brand-teal hover:bg-brand-teal/5`
                    }
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                      transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
            {/* Slider Controls */}
            <div
              className="flex justify-center items-center gap-4 mt-8"
            >
              <button
                className={`px-4 py-2 rounded-full bg-brand-teal text-white font-bold shadow transition disabled:opacity-40`}
                onClick={() => setSlide(slide === 0 ? totalSlides - 1 : slide - 1)}
                aria-label="Previous"
              >
                &larr;
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button
                    key={i}
                    className={`w-3 h-3 rounded-full ${slide === i ? 'bg-brand-teal' : 'bg-brand-dark-blue/30'} border border-brand-teal transition`}
                    onClick={() => setSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <button
                className={`px-4 py-2 rounded-full bg-brand-teal text-white font-bold shadow transition disabled:opacity-40`}
                onClick={() => setSlide((slide + 1) % totalSlides)}
                aria-label="Next"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
          <Button
            asChild
            size="lg"
            variant="colorful-glow"
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
            className="focus-ring border-brand-teal text-brand-teal"
          >
            <Link href="/membership">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
