'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function PublicHealthHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const handleScroll = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg2.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          unoptimized
          aria-hidden="true"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-brand-dark-blue"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(30px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.4s, transform 1.8s ease-out 0.4s',
            }}
          >
            Public Health
          </h1>
          <p 
            className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
            }}
          >
            Stay informed with the latest medical news, evidence-based health information, and resources to help you make informed decisions about your health and wellness.
          </p>

          {/* Primary CTAs */}
          <div 
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.8s ease-out 0.8s, transform 1.8s ease-out 0.8s',
            }}
          >
            <Button
              size="lg"
              variant="gradient"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('disease-topics')}
            >
              Browse Topics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('latest-news')}
            >
              Latest News
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleScroll('prevention')}
            >
              Prevention & Wellness
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
