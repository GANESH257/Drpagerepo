'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { doctors } from '@/data/doctors';
import { communityComments } from '@/data/communityComments';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2, User } from 'lucide-react';

export function CommunityCommentsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
    }).slice(0, 8);
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

  return (
    <section 
      ref={sectionRef} 
      id="community-comments" 
      className="py-16 md:py-24 relative overflow-hidden skin-slate"
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
            What Our Community Is Saying
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Patient feedback and physician member insights from our network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allComments.map((comment, index) => {
            const cardDelay = prefersReducedMotion ? 0 : index * 300;
            const isPatient = comment.role === 'patient';
            const verified = isPatient && 'verified' in comment ? (comment as any).verified : false;

            return (
              <Card 
                key={comment.id} 
                className="h-full card-vibrant focus-ring group relative"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible && !prefersReducedMotion
                    ? 'translateY(0) rotate(0deg)' 
                    : index % 2 === 0 
                      ? 'translateY(30px) rotate(-2deg)' 
                      : 'translateY(30px) rotate(2deg)',
                  transition: prefersReducedMotion
                    ? `opacity 0.3s ease ${cardDelay}ms`
                    : `opacity 0.7s ease-out ${cardDelay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                }}
              >
                <CardContent className="p-6 relative">
                  {/* Quote Mark Decoration */}
                  <div 
                    className="absolute top-4 left-4 text-6xl font-serif text-brand-teal/10 -z-0"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion ? 'scale(1)' : 'scale(0)',
                      transition: prefersReducedMotion
                        ? 'opacity 0.3s ease'
                        : `opacity 1.2s ease-out ${cardDelay + 300}ms, transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay + 300}ms`,
                    }}
                  >
                    "
                  </div>
                  <div className="flex items-start justify-between mb-4 gap-3 relative z-10">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      {isPatient && comment.rating && (
                        <div className="flex items-center gap-1">
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
                          <span className="ml-1 font-semibold text-sm md:text-base text-brand-dark-blue">
                            {comment.rating!.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Badge 
                        variant={isPatient ? 'secondary' : 'outline'}
                        className={`text-xs ${
                          isPatient 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20'
                        }`}
                      >
                        {isPatient ? (
                          <>
                            <User className="h-3 w-3 mr-1" aria-hidden="true" />
                            Patient
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                            Physician Member
                          </>
                        )}
                      </Badge>
                      {verified && (
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                          Verified Visit
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-base md:text-lg text-gray-700 mb-4 leading-relaxed">{comment.comment}</p>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                    <span className="font-semibold text-brand-dark-blue">{comment.author}</span>
                    <span className="text-gray-600">
                      {comment.date ? new Date(comment.date).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {isPatient && 'doctorName' in comment && comment.doctorName && (
                    <div className="mt-2 text-xs md:text-sm text-gray-600">
                      {comment.doctorName} - {comment.doctorSpecialty}
                    </div>
                  )}
                  {!isPatient && 'specialty' in comment && comment.specialty && (
                    <div className="mt-2 text-xs md:text-sm text-gray-600">
                      {comment.specialty}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
