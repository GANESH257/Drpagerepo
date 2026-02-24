'use client';

import { useEffect, useRef, useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import { memberBenefits } from '@/data/memberBenefits';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

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
      className="py-20 md:py-32 relative overflow-hidden bg-[#e9f8f8]"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header – same style as JoinSteps (Mission-style, light background) */}
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
              Benefits
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue leading-[1.1] tracking-tight">
              Member <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-emerald-600">Benefits</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                      transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    className="h-full"
                  >
                    <div
                      className="group relative overflow-hidden h-full cursor-pointer rounded-2xl p-6 flex flex-col gap-2 transition-all duration-500 ease-out data-scroll-exclude bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15 hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02] hover:bg-white/75"
                    >
                      {/* Standard card layers (same as Contact/Benefits) */}
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

                      <div className="relative z-10 flex flex-col items-center text-center gap-2">
                        <div className={cn('w-24 h-24 rounded-3xl flex items-center justify-center mb-2 shadow-2xl text-white relative overflow-hidden transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)] bg-gradient-to-br from-brand-dark-blue to-brand-teal', isVisible && !prefersReducedMotion && 'pulsate-bck-normal')}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" aria-hidden />
                          <IconComponent className="h-12 w-12 relative z-10" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-brand-dark-blue mb-1 transition-colors duration-300">{benefit.title}</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">{benefit.description}</p>
                      </div>
                    </div>
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
      </div>
    </section>
  );
}
