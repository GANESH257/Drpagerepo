'use client';

import { useEffect, useState, useRef } from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BoardCertifiedBadge() {
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
      className="py-16 md:py-24 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card
            className="border-2 border-brand-teal/20 bg-gradient-to-br from-brand-teal/5 via-white to-brand-dark-blue/5 hover:border-brand-teal/40 transition-all duration-300 relative overflow-hidden"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
            }}
          >
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-brand-teal/20 to-brand-dark-blue/20 flex items-center justify-center border-4 border-brand-teal/30">
                  <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 text-brand-teal" aria-hidden="true" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-brand-dark-blue">
                  Board-Certified Guarantee
                </h3>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  Every physician in our network is board-certified and has been vetted by our membership committee.
                </p>
              </div>

              {/* Badge Icon */}
              <div className="flex-shrink-0">
                <Award className="h-12 w-12 md:h-16 md:w-16 text-brand-teal/60" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
