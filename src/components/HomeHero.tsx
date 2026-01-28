'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { homeStats } from '@/data/homeStats';
import { ArrowRight } from 'lucide-react';

export function HomeHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [animatedStats, setAnimatedStats] = useState<Record<number, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      setIsVisible(true);

      // Parallax scroll effect
      const handleScroll = () => {
        if (!prefersReducedMotion) {
          setScrollY(window.scrollY);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [prefersReducedMotion]);

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
      className="relative w-full h-[600px] md:h-[700px] overflow-hidden skin-hero mt-24 md:mt-28"
      aria-label="Hero section"
    >
      {/* Video Background with Parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          transform: !prefersReducedMotion ? `translateY(${scrollY * 0.5}px)` : 'none',
          transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src="/Backgroundnew.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-center">
        <div 
          className="max-w-3xl w-full"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
          }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-white drop-shadow-lg">
            <span className="whitespace-nowrap">Connect. <span className="text-brand-teal drop-shadow-md">Collaborate.</span></span>
            <br />
            <span className="whitespace-nowrap">Refer. <span className="text-brand-teal drop-shadow-md">Find Elite Care</span></span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/95 drop-shadow-md leading-relaxed max-w-2xl">
            A trusted physician network and patient directory that supports referrals, collaboration, and easier access to quality care across specialties.
          </p>

          {/* Stats Strip - Inline Horizontal */}
          <div 
            className="flex flex-row flex-wrap md:flex-nowrap items-center justify-center gap-3 md:gap-4 lg:gap-6 mb-8 md:mb-10 bg-white/95 backdrop-blur-md px-3 md:px-4 lg:px-6 py-3 md:py-4 rounded-xl border border-white/60 shadow-lg w-full md:w-fit"
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
              const isVerified = stat.value === 'Verified';
              
              return (
                <div key={index} className="flex flex-col items-center flex-shrink-0">
                  <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-brand-dark-blue leading-none text-center">
                    {isNumeric ? `${numericValue}${suffix}` : stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium mt-0.5 text-center">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary CTAs */}
          <div 
            className="inline-flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 md:mb-10"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
            }}
          >
            <Button
              asChild
              size="lg"
              variant="gradient-multi"
              className="w-full sm:w-auto focus-ring shadow-lg hover:shadow-xl"
            >
              <Link href="/doctors">
                Find a Doctor
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
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
        </div>
      </div>
    </section>
  );
}
