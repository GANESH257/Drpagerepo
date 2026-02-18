'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { patientReviews } from '@/data/patientsPage';

export function PatientReviews() {
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [isVisible]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.review-card')?.clientWidth || 400;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.review-card')?.clientWidth || 400;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="py-16 md:py-24 relative overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div
          className="text-center mb-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion
              ? 'opacity 0.3s ease'
              : 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
          }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-brand-dark-blue">
            Patient Reviews
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Read authentic reviews from verified patients who have visited our physicians.
          </p>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="relative mb-8">
          {/* Left Arrow Button (Desktop Only) */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white border-2 border-gray-200 shadow-lg hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-all duration-200 focus-ring disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory -mx-4 px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-6">
              {patientReviews.map((review, index) => {
                const cardDelay = prefersReducedMotion ? 0 : index * 100;

                return (
                  <Card
                    key={review.id}
                    className="review-card flex-shrink-0 w-[calc(100%-2rem)] md:w-[400px] lg:w-[450px] h-full snap-start hover:shadow-xl transition-all hover:-translate-y-1 bg-white border border-gray-200 hover:border-brand-teal/30 flex flex-col"
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
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(review.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : i < review.rating
                                  ? 'fill-yellow-400/50 text-yellow-400/50'
                                  : 'text-gray-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                          <span className="ml-2 font-semibold text-brand-dark-blue">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                        {review.verified && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-brand-teal/10 text-brand-teal border-brand-teal/20"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                            Verified Visit
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed flex-grow">{review.comment}</p>
                      <div className="flex items-center justify-between text-sm mt-auto">
                        <span className="font-medium text-brand-dark-blue">{review.patientName}</span>
                        <span className="text-gray-500">{review.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Arrow Button (Desktop Only) */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white border-2 border-gray-200 shadow-lg hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-all duration-200 focus-ring disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* View More Button */}
        <div
          className="text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 1.2s, transform 1.5s ease-out 1.2s',
          }}
        >
          <Button
            asChild
            variant="outline"
            className="border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white focus-ring transition-all duration-200 hover:scale-105"
          >
            <Link href="#reviews">
              View More
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
