'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { doctors } from '@/data/doctors';
import { communityComments } from '@/data/communityComments';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export function CommunityCommentsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Memoize and ensure deterministic ordering
  // CRITICAL: This must produce identical results on server and client
  const allComments = useMemo(() => {
    // Step 1: Get featured doctors sorted by ID (deterministic)
    const featuredDoctors = doctors
      .filter((d) => d.featured)
      .sort((a, b) => {
        // Use numeric comparison if IDs are numeric, otherwise string
        const aNum = parseInt(a.id, 10);
        const bNum = parseInt(b.id, 10);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.id.localeCompare(b.id);
      });
    
    // Step 2: Collect patient reviews with stable keys
    // Use doctor ID + review ID for guaranteed uniqueness and determinism
    const patientReviewsWithKeys: Array<{
      id: string;
      originalId: string;
      author: string;
      role: 'patient';
      comment: string;
      rating?: number;
      doctorName: string;
      doctorSpecialty: string;
      date?: string;
      verified?: boolean;
      compositeKey: string; // doctorId-reviewId for stable sorting
    }> = [];
    
    featuredDoctors.forEach((doctor) => {
      // Sort reviews by ID (deterministic) and take first 2
      const doctorReviews = [...doctor.reviews]
        .sort((a, b) => {
          // Extract numeric part if possible for stable sorting
          const aMatch = a.id.match(/\d+/);
          const bMatch = b.id.match(/\d+/);
          if (aMatch && bMatch) {
            const aNum = parseInt(aMatch[0], 10);
            const bNum = parseInt(bMatch[0], 10);
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return aNum - bNum;
            }
          }
          return a.id.localeCompare(b.id);
        })
        .slice(0, 2);
      
      doctorReviews.forEach((review) => {
        patientReviewsWithKeys.push({
          id: `patient-${doctor.id}-${review.id}`,
          originalId: review.id,
          author: review.patientName,
          role: 'patient' as const,
          comment: review.comment,
          rating: review.rating,
          doctorName: doctor.fullName,
          doctorSpecialty: doctor.specialty,
          date: review.date,
          verified: review.verified,
          compositeKey: `${doctor.id.padStart(3, '0')}-${review.id}`, // Zero-padded for stable sort
        });
      });
    });

    // Step 3: Sort patient reviews by composite key (deterministic), then take first 4
    patientReviewsWithKeys.sort((a, b) => a.compositeKey.localeCompare(b.compositeKey));
    const selectedPatientReviews = patientReviewsWithKeys.slice(0, 4).map(({ compositeKey, ...review }) => review);

    // Step 4: Sort community comments by ID (deterministic)
    const sortedCommunityComments = [...communityComments]
      .sort((a, b) => {
        // Numeric comparison if possible
        const aNum = parseInt(a.id, 10);
        const bNum = parseInt(b.id, 10);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.id.localeCompare(b.id);
      })
      .slice(0, 4)
      .map((comment) => ({
        ...comment,
        id: `community-${comment.id}`,
        originalId: comment.id,
      }));

    // Step 5: Combine and final sort by ID (deterministic)
    const combined = [...selectedPatientReviews, ...sortedCommunityComments];
    
    // Final sort ensures consistent order
    return combined.sort((a, b) => {
      // Extract numeric prefixes for stable sorting
      const aPrefix = a.id.split('-')[0];
      const bPrefix = b.id.split('-')[0];
      if (aPrefix !== bPrefix) {
        return aPrefix.localeCompare(bPrefix);
      }
      return a.id.localeCompare(b.id);
    }).slice(0, 8); // Show more comments for scrolling
  }, []); // Empty deps - data is static

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
      const cardWidth = scrollContainerRef.current.querySelector('.comment-card')?.clientWidth || 400;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.comment-card')?.clientWidth || 400;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      id="community-comments" 
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
              What Our Community Is Saying
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              Patient feedback and physician member insights from our network.
            </p>
          </div>

          {/* Horizontal Scrolling Container */}
          <div className="relative">
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
              <div className="flex gap-4 md:gap-6">
                {allComments.map((comment, index) => {
                  const cardDelay = prefersReducedMotion ? 0 : index * 100;
                  const isPatient = comment.role === 'patient';

                  return (
                    <Card
                      key={comment.id}
                      className="comment-card flex-shrink-0 w-[calc(100%-2rem)] md:w-[400px] lg:w-[450px] bg-white border-2 border-gray-100 hover:border-brand-teal/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group snap-start"
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
                        
                        {/* Rating for patients */}
                        {isPatient && comment.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(comment.rating!)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                            <span className="ml-1 font-semibold text-sm text-brand-dark-blue">
                              {comment.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                          {comment.comment}
                        </p>
                        
                        <div className="pt-3 border-t border-gray-100">
                          <div className="font-semibold text-brand-dark-blue text-sm md:text-base">
                            {comment.author}
                          </div>
                          <div className="text-xs md:text-sm text-gray-600 mt-0.5">
                            {isPatient && 'doctorName' in comment && comment.doctorName
                              ? `${comment.doctorName} - ${comment.doctorSpecialty}`
                              : !isPatient && 'specialty' in comment && comment.specialty
                              ? comment.specialty
                              : isPatient ? 'Patient' : 'Physician Member'}
                          </div>
                          {comment.date && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
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
        </div>
      </div>
    </section>
  );
}
