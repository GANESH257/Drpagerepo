'use client';

import { useEffect, useRef, useState } from 'react';
import { globalMedicalEvents } from '@/data/globalMedicalEvents';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Globe, ExternalLink } from 'lucide-react';

export function GlobalMedicalEventsSection() {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section 
      ref={sectionRef} 
      id="events" 
      className="py-16 md:py-20 lg:py-24 relative skin-slate overflow-hidden"
    >

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            Upcoming Global Medical Events
          </h2>
          <p 
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1.5s ease-out 0.8s, transform 1.5s ease-out 0.8s',
            }}
          >
            Join leading medical conferences, webinars, and continuing education events from around the world.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {globalMedicalEvents.map((event, index) => {
            const cardDelay = index * 100;
            return (
              <Card
                key={event.id}
                className="h-full transition-all duration-300 hover:shadow-xl border-gray-200 bg-white group hover-lift"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? 'translateY(0) scale(1)' 
                    : 'translateY(50px) scale(0.9)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${cardDelay}ms`
                    : `opacity 1.8s ease-out ${cardDelay}ms, transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms, box-shadow 0.3s ease`,
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-start justify-between gap-2">
                      <Badge 
                        variant={event.isOnline ? 'vibrant' : 'colorful'}
                        className="text-xs"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(-10px)',
                          transition: prefersReducedMotion
                            ? 'opacity 0.3s ease'
                            : `opacity 1.2s ease-out ${cardDelay + 300}ms, transform 1.2s ease-out ${cardDelay + 300}ms`,
                        }}
                      >
                        {event.isOnline ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 mr-1" />
                            In-Person
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar 
                        className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible && !prefersReducedMotion ? 'rotate(0deg) scale(1)' : 'rotate(-180deg) scale(0)',
                          transition: prefersReducedMotion
                            ? 'opacity 0.3s ease'
                            : `opacity 0.6s ease-out ${cardDelay + 200}ms, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay + 200}ms`,
                        }}
                      />
                      <span 
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transition: prefersReducedMotion
                            ? 'opacity 0.3s ease'
                            : `opacity 1.2s ease-out ${cardDelay + 900}ms`,
                        }}
                      >
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-brand-dark-blue group-hover:text-brand-teal transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-grow">
                      {event.description}
                    </p>
                    <div className="text-xs text-gray-500 mb-2">
                      {event.location}
                    </div>
                    {event.url && (
                      <a
                        href={event.url}
                        className="flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors mt-auto focus-ring rounded-md px-1 -ml-1"
                      >
                        Learn more
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
