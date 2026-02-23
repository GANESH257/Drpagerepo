'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function WhoShouldJoin() {
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
      className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center mb-12"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
            }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue">
              Who Should Join?
            </h2>
          </div>

          <Card
            className="border-2 border-brand-teal/20 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
            }}
          >
            <CardContent className="p-8 md:p-10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-brand-teal" aria-hidden="true" />
                </div>
                <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
                  The Alliance is for board-certified physicians in private practice who are committed to providing high-quality, patient-centered care. If you are looking to grow your practice, reduce administrative burdens, and collaborate with a network of your peers, you are in the right place.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
