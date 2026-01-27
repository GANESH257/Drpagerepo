'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doctors } from '@/data/doctors';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorFilters } from '@/components/DoctorFilters';
import { GenericCTASection } from '@/components/GenericCTASection';
import { Doctor } from '@/types';

function DoctorsPageContent() {
  const searchParams = useSearchParams();
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(doctors);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const getSearchParam = (key: string, defaultValue: string = '') => {
    try {
      return searchParams?.get(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const filters = useMemo(
    () => ({
      specialty: getSearchParam('specialty', ''),
      location: getSearchParam('location', ''),
      insurance: getSearchParam('insurance', ''),
      name: getSearchParam('name', ''),
      lastNamePrefix: getSearchParam('lastNamePrefix', ''),
      availability: getSearchParam('availability', ''),
      sort: getSearchParam('sort', 'rating-desc'),
    }),
    [searchParams]
  );

  useEffect(() => {
    let result = [...doctors];

    // Filter by specialty
    if (filters.specialty && filters.specialty !== 'all') {
      // Normalize filter value: replace hyphens with spaces for better matching
      const normalizedFilter = filters.specialty.toLowerCase().replace(/-/g, ' ');
      result = result.filter((d) => {
        const doctorSpecialty = d.specialty.toLowerCase();
        // Check if specialty matches directly or if it includes the normalized filter
        const matchesMainSpecialty = doctorSpecialty === normalizedFilter || doctorSpecialty.includes(normalizedFilter);
        
        // Also check specialties array if it exists
        if (matchesMainSpecialty) return true;
        if (d.specialties && Array.isArray(d.specialties)) {
          return d.specialties.some((spec) => {
            const specLower = spec.toLowerCase();
            return specLower === normalizedFilter || specLower.includes(normalizedFilter);
          });
        }
        return false;
      });
    }

    // Filter by location
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter((d) =>
        d.locations.some(
          (loc) =>
            (loc.city && loc.city.toLowerCase().includes(locationLower)) ||
            (loc.state && loc.state.toLowerCase().includes(locationLower)) ||
            (loc.zip && loc.zip.includes(locationLower))
        )
      );
    }

    // Filter by insurance
    if (filters.insurance && filters.insurance !== 'all') {
      result = result.filter((d) =>
        d.insurance.some((ins) => ins.name === filters.insurance)
      );
    }

    // Filter by name
    if (filters.name) {
      const nameLower = filters.name.toLowerCase();
      result = result.filter(
        (d) =>
          d.firstName.toLowerCase().includes(nameLower) ||
          d.lastName.toLowerCase().includes(nameLower) ||
          d.fullName.toLowerCase().includes(nameLower)
      );
    }

    // Filter by last name prefix
    if (filters.lastNamePrefix) {
      result = result.filter((d) =>
        d.lastName.toLowerCase().startsWith(filters.lastNamePrefix.toLowerCase())
      );
    }

    // Filter by availability (dummy - check if has available slots)
    if (filters.availability && filters.availability !== 'all') {
      result = result.filter((d) => d.availability.some((slot) => slot.available));
    }

    // Sort - Featured doctors first, then by selected criteria
    result.sort((a, b) => {
      // First, prioritize featured doctors
      const aFeatured = a.featured ?? false;
      const bFeatured = b.featured ?? false;
      if (aFeatured !== bFeatured) {
        return bFeatured ? 1 : -1; // Featured first
      }
      
      // Then apply selected sort
      switch (filters.sort) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'reviews-desc':
          return b.reviewCount - a.reviewCount;
        case 'name-asc':
          return (a.lastName || '').localeCompare(b.lastName || '');
        case 'name-desc':
          return (b.lastName || '').localeCompare(a.lastName || '');
        default:
          return 0;
      }
    });

    setFilteredDoctors(result);
  }, [filters]);

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
    // Set visible immediately for better UX
    setIsVisible(true);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen skin-slate">
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div 
          className="mb-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(20px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
          }}
        >
          <h1 className="text-3xl md:text-4xl lg:text-3xl font-bold mb-2 text-brand-dark-blue">
            Find a Doctor
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Browse our directory of {doctors.length} independent physicians
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside 
            className="md:w-64 flex-shrink-0"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
            }}
          >
            <DoctorFilters />
          </aside>

          {/* Results */}
          <main className="flex-1">
            {filteredDoctors.length === 0 ? (
              <div 
                className="text-center py-12"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.4s',
                }}
              >
                <p className="text-lg text-muted-foreground mb-4">
                  No doctors found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            ) : (
              <>
                <div 
                  className="mb-4 text-sm text-muted-foreground"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.4s',
                  }}
                >
                  Showing {filteredDoctors.length} doctor
                  {filteredDoctors.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map((doctor, index) => {
                    const cardDelay = prefersReducedMotion ? 0 : index * 50;
                    return (
                      <div
                        key={doctor.id}
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible && !prefersReducedMotion
                            ? 'translateY(0) scale(1)' 
                            : 'translateY(30px) scale(0.95)',
                          transition: prefersReducedMotion
                            ? `opacity 0.3s ease ${cardDelay}ms`
                            : `opacity 0.7s ease-out ${cardDelay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${cardDelay}ms`,
                        }}
                      >
                        <DoctorCard doctor={doctor} />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <GenericCTASection />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen skin-slate flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-brand-dark-blue text-lg">Loading doctors directory...</p>
        </div>
      </div>
    }>
      <DoctorsPageContent />
    </Suspense>
  );
}
