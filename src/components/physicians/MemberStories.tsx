'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { memberStories } from '@/data/physiciansPage';
import { Quote } from 'lucide-react';

export function MemberStories() {
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
      className="py-10 md:py-14 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-8 md:mb-10"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
            }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-brand-dark-blue">
              Member Success Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {memberStories.map((story, index) => {
              const cardDelay = prefersReducedMotion ? 0 : index * 100;

              return (
                <Card
                  key={story.id}
                  className="bg-white border-2 border-gray-100 hover:border-brand-teal/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible && !prefersReducedMotion
                      ? 'translateY(0) scale(1)'
                      : 'translateY(30px) scale(0.95)',
                    transition: prefersReducedMotion
                      ? `opacity 0.3s ease ${cardDelay}ms`
                      : `opacity 0.8s ease-out ${cardDelay}ms, transform 0.8s ease-out ${cardDelay}ms`,
                  }}
                >
                  {/* Decorative quote mark */}
                  <div className="absolute top-4 right-4 text-6xl font-serif text-brand-teal/5 group-hover:text-brand-teal/10 transition-colors duration-300 -z-0">
                    "
                  </div>
                  
                  <CardContent className="p-5 md:p-6 relative z-10">
                    <Quote className="h-5 w-5 text-brand-teal mb-3" aria-hidden="true" />
                    <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                      {story.quote}
                    </p>
                    <div className="pt-3 border-t border-gray-100">
                      <div className="font-semibold text-brand-dark-blue text-sm md:text-base">
                        {story.author}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 mt-0.5">
                        {story.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
