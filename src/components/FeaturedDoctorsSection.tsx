'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { doctors } from '@/data/doctors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle2, UserPlus } from 'lucide-react';

export function FeaturedDoctorsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const featured = doctors.filter((d) => d.featured).slice(0, 6);

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

  return (
    <section 
      ref={sectionRef} 
      id="featured-doctors" 
      className="py-16 md:py-24 relative overflow-hidden skin-tint"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div 
          className="text-center mb-12 md:mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
          }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-brand-dark-blue">
            Featured Doctors
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Meet some of our highly rated Board Certified Specialists across various specialties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((doctor, index) => {
            const cardDelay = prefersReducedMotion ? 0 : index * 300;
            return (
              <Card
                key={doctor.id}
                className="h-full card-vibrant group focus-ring"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? 'translateY(0) scale(1)' 
                    : 'translateY(40px) scale(0.95)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${cardDelay}ms`
                    : `opacity 1.6s cubic-bezier(0.4, 0, 0.2, 1) ${cardDelay}ms, transform 1.6s cubic-bezier(0.4, 0, 0.2, 1) ${cardDelay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                }}
                onMouseEnter={(e) => {
                  if (!prefersReducedMotion) {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!prefersReducedMotion) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl md:text-2xl group-hover:text-brand-teal transition-colors mb-1 break-words">
                        {doctor.fullName}
                      </CardTitle>
                      <CardDescription className="text-sm md:text-base mt-1 break-words">
                        {doctor.specialty}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {doctor.verified && (
                        <Badge 
                          variant="vibrant" 
                          className="text-xs"
                          style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(-10px)',
                            transition: prefersReducedMotion
                              ? 'opacity 0.3s ease'
                              : `opacity 1.2s ease-out ${cardDelay + 400}ms, transform 1.2s ease-out ${cardDelay + 400}ms`,
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                          Verified
                        </Badge>
                      )}
                      {doctor.acceptsNewPatients && (
                        <Badge 
                          variant="outline" 
                          className="border-green-500/30 text-green-700 bg-green-50/50 text-xs"
                          style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(-10px)',
                            transition: prefersReducedMotion
                              ? 'opacity 0.3s ease'
                              : `opacity 0.5s ease-out ${cardDelay + 300}ms, transform 0.5s ease-out ${cardDelay + 300}ms`,
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" aria-hidden="true" />
                          Accepting
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`h-4 w-4 ${
                            starIndex < Math.floor(doctor.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : starIndex < doctor.rating
                              ? 'fill-yellow-400/50 text-yellow-400/50'
                              : 'text-gray-300'
                          }`}
                          style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible && !prefersReducedMotion ? 'scale(1)' : 'scale(0.8)',
                            transition: prefersReducedMotion
                              ? 'opacity 0.3s ease'
                              : `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${cardDelay + starIndex * 100}ms, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${cardDelay + starIndex * 100}ms`,
                          }}
                          aria-hidden="true"
                        />
                      ))}
                      <span 
                        className="ml-1 font-semibold text-brand-dark-blue text-sm md:text-base"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transition: prefersReducedMotion
                            ? 'opacity 0.3s ease'
                            : `opacity 1.2s ease-out ${cardDelay + 1000}ms`,
                        }}
                      >
                        {doctor.rating.toFixed(1)}
                      </span>
                    </div>
                    <span 
                      className="text-gray-600 text-xs md:text-sm"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: prefersReducedMotion
                          ? 'opacity 0.3s ease'
                          : `opacity 0.5s ease-out ${cardDelay + 600}ms`,
                      }}
                    >
                      ({doctor.reviewCount} reviews)
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {doctor.bio}
                  </p>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 focus-ring hover:scale-105"
                  >
                    <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div 
          className="text-center mt-10 md:mt-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 1.2s, transform 1.5s ease-out 1.2s',
          }}
        >
          <Button 
            asChild 
            size="lg" 
            className="bg-brand-teal hover:bg-brand-teal/90 text-white focus-ring transition-all duration-200 hover:scale-105 shadow-md"
          >
            <Link href="/doctors">View All Doctors</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
