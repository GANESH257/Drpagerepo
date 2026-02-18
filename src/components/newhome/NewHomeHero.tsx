'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { homeStats } from '@/data/homeStats';
import { ArrowRight } from 'lucide-react';
import { TopSearchBar } from '../DoctorFilters';

export function NewHomeHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      setIsVisible(true);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Animate stats counter
  useEffect(() => {
    if (!isVisible) return;

    const timers: NodeJS.Timeout[] = [];

    if (!prefersReducedMotion) {
      homeStats.forEach((stat, index) => {
        const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
        if (numericValue > 0) {
          const duration = 2000;
          const steps = 60;
          const increment = numericValue / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
              setAnimatedStats(prev => ({ ...prev, [index]: numericValue }));
              clearInterval(timer);
            } else {
              setAnimatedStats(prev => ({ ...prev, [index]: Math.floor(current) }));
            }
          }, duration / steps);
          timers.push(timer);
        } else {
          // For non-numeric values like "Verified", set immediately
          setAnimatedStats(prev => ({ ...prev, [index]: 0 }));
        }
      });
    } else {
      // Set final values immediately if reduced motion
      const finalStats: Record<number, number> = {};
      homeStats.forEach((stat, index) => {
        const numericValue = parseInt(stat.value.replace(/\D/g, '')) || 0;
        finalStats[index] = numericValue;
      });
      setAnimatedStats(finalStats);
    }

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [isVisible, prefersReducedMotion]);

  return (
    <section
      id="main-content"
      className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden mt-24 md:mt-28 bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-teal/30"
      aria-label="Hero section"
    >
      {/* Container with flex layout */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 min-h-[600px] md:min-h-[700px] py-12 md:py-16 lg:py-20">
          {/* Content Area */}
          <div className="flex-1 w-full lg:w-auto">
            <div
              className="max-w-2xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
              }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-8 leading-[1.15] text-white tracking-tight">
                <span className="whitespace-nowrap">Connect. <span className="text-brand-teal">Collaborate.</span></span>
                <br />
                <span className="whitespace-normal sm:whitespace-nowrap">Refer. <span className="text-brand-teal">Find Elite Care</span></span>
              </h1>
              <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90 leading-relaxed max-w-xl">
                A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care.
              </p>

              {/* Stats Strip - Tightly wrapped and centered on mobile */}
              <div
                className="inline-flex flex-wrap items-center justify-start gap-0 md:gap-0 mb-8 md:mb-10 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 shadow-xl overflow-hidden w-fit"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
                }}
              >
                {homeStats.map((stat, index) => {
                  const numericValue = animatedStats[index] ?? 0;
                  const suffix = stat.value.replace(/\d/g, '');
                  const isNumeric = numericValue > 0;

                  return (
                    <div key={index} className="flex flex-col items-start px-4 py-2.5 md:px-6 md:py-3.5 border-r border-white/10 last:border-r-0 hover:bg-white/5 transition-colors cursor-default">
                      <div className="text-sm md:text-lg lg:text-xl font-black text-white leading-tight">
                        {isNumeric ? `${numericValue}${suffix}` : stat.value}
                      </div>
                      <div className="text-[10px] md:text-xs text-brand-teal font-bold uppercase tracking-wider mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Primary CTAs */}
              <div
                className="flex flex-col gap-8"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
                }}
              >
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  <Button
                    asChild
                    size="lg"
                    variant="colorful-glow"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 w-full sm:w-auto focus-ring shadow-lg hover:shadow-xl"
                  >
                    <Link href="/join-us">Join the Network</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="colorful-glow"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 w-full sm:w-auto focus-ring shadow-lg hover:shadow-xl"
                  >
                    <Link href="#departments">Explore Medical Specialties</Link>
                  </Button>
                </div>

                {/* Integrated Search Bar */}
                <div className="w-full max-w-4xl lg:ml-0">
                  <Suspense fallback={
                    <div className="w-full h-16 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 animate-pulse" />
                  }>
                    <TopSearchBar />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>

          {/* Circular Video Element */}
          <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] rounded-full overflow-hidden relative">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-[center_30%] rounded-full"
                aria-hidden="true"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1s ease-out 0.3s',
                }}
              >
                <source src="/network_video.webm" type="video/webm" />
              </video>
          </div>
        </div>
      </div>
    </section>
  );
}
