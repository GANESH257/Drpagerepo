'use client';

import { useEffect, useState } from 'react';
import { homeStats } from '@/data/homeStats';

interface NewHomeHeroDocumentedProps {
  subheadline?: string;
  videoSource?: string;
  darkOverlay?: boolean; // If true, use darker/blacker overlay instead of blue
}

export function NewHomeHeroDocumented({ subheadline, videoSource = '/Backgroundnewvid.mp4', darkOverlay = false }: NewHomeHeroDocumentedProps) {
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
      className="relative w-full min-h-[570px] md:min-h-[670px] overflow-hidden mt-32 md:mt-28 bg-black"
      aria-label="Hero section"
    >
      {/* Full Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1s ease-out 0.3s',
          }}
          onError={(e) => {
            console.error('Video failed to load:', videoSource, e);
          }}
          onLoadedData={() => {
            console.log('Video loaded successfully:', videoSource);
          }}
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay - Dark/Black for dark mode, Blue for regular */}
        <div 
          className={`absolute inset-0 z-[1] ${
            darkOverlay 
              ? 'bg-gradient-to-br from-black/70 via-black/65 to-black/75' 
              : 'bg-gradient-to-br from-brand-dark-blue/60 via-brand-dark-blue/55 to-brand-dark-blue/65'
          }`}
        />
      </div>

      {/* Container with flex layout */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="flex flex-col items-start min-h-[570px] md:min-h-[670px] py-12 md:py-16 lg:py-20">
          {/* Content Area - 40% width */}
          <div className="w-full lg:w-[40%] flex flex-col h-full">
            {/* Heading - Top */}
            <div
              className="mb-8 md:mb-12"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
              }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-white tracking-tight">
                <span className="whitespace-nowrap">United in Care</span>
                <br />
                <span className="whitespace-normal sm:whitespace-nowrap"><span className="text-brand-teal">Dedicated to You</span></span>
              </h1>
            </div>

            {/* Subtitle - Middle */}
            {subheadline && (
              <div
                className="my-auto py-8 md:py-12"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
                }}
              >
                <p className="text-lg md:text-xl lg:text-2xl text-white font-medium leading-relaxed max-w-2xl tracking-wide">
                  {subheadline}
                </p>
              </div>
            )}

            {/* Stats Strip - Lower Half */}
            <div
              className="mt-auto pt-8 md:pt-12"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
                transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
              }}
            >
              <div className="inline-flex flex-nowrap items-center justify-start gap-0 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 shadow-xl overflow-hidden w-fit">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
