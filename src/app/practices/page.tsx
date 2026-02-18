'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllDoctors } from '@/lib/memberStorage';
import { InstitutionCard } from '@/components/InstitutionCard';
import { DoctorCard } from '@/components/DoctorCard';
import { SidebarFilters, TopSearchBar } from '@/components/PracticeFilters';
import { GenericCTASection } from '@/components/GenericCTASection';
import { Doctor } from '@/types';
import { Search } from 'lucide-react';
import { searchInstitutions, InstitutionSearchResult } from '@/lib/institutionSearch';

function PracticesPageContent() {
  const searchParams = useSearchParams();
  const [filteredInstitutions, setFilteredInstitutions] = useState<InstitutionSearchResult[]>([]);
  const [doctorMatches, setDoctorMatches] = useState<Doctor[] | undefined>(undefined);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Load doctors (with deleted filter applied)
    const doctors = getAllDoctors();
    setAllDoctors(doctors);
  }, []);

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
      availability: getSearchParam('availability', ''),
      sort: getSearchParam('sort', 'rating-desc'),
      radiusMiles: getSearchParam('radius', '') || 'none',
      userLat: getSearchParam('userLat') ? parseFloat(getSearchParam('userLat')) : undefined,
      userLng: getSearchParam('userLng') ? parseFloat(getSearchParam('userLng')) : undefined,
    }),
    [searchParams]
  );

  useEffect(() => {
    // Search institutions with filters
    const searchFilters = {
      specialty: filters.specialty || undefined,
      zip: filters.location || undefined, // This will be used for ZIP extraction
      insurance: filters.insurance || undefined,
      availability: filters.availability || undefined,
      name: filters.name || undefined,
      radiusMiles: filters.radiusMiles && filters.radiusMiles !== 'none' ? parseFloat(filters.radiusMiles) : undefined,
      userLat: filters.userLat,
      userLng: filters.userLng,
      sort: (filters.sort === 'distance' ? 'distance' : filters.sort === 'name' ? 'name' : 'rating') as 'distance' | 'name' | 'rating',
    };

    const results = searchInstitutions(searchFilters);
    setFilteredInstitutions(results.institutions);
    setDoctorMatches(results.doctorMatches);
  }, [filters]);

  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const hasNameSearch = !!filters.name;
  const showDoctorResults = hasNameSearch && doctorMatches && doctorMatches.length > 0;

  return (
    <div ref={sectionRef} className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-32 pb-16">
        {/* Top Search Bar */}
        <div
          className="relative z-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(-20px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue tracking-tight">
              Find a Practice
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover independent medical practices and clinics with top-rated physicians in your area.
            </p>
          </div>
          <TopSearchBar />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className="md:w-72 flex-shrink-0"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
            }}
          >
            <SidebarFilters />
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Institution Results */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              {filteredInstitutions.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.4s',
                  }}
                >
                  <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No practices found</h3>
                  <p className="text-gray-500 mb-6">
                    {filters.radiusMiles && filters.radiusMiles !== 'none' && !filters.location && !filters.userLat
                      ? 'Please enter a ZIP code or enable location access to search by radius.'
                      : 'We couldn\'t find any practices matching your current filters.'}
                  </p>
                  <button
                    onClick={() => window.location.href = '/practices'}
                    className="text-brand-teal font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.4s',
                    }}
                  >
                    <div>
                      <h2 className="text-xl font-bold text-brand-dark-blue">
                        {filteredInstitutions.length} {filteredInstitutions.length === 1 ? 'Practice' : 'Practices'} available
                      </h2>
                      <p className="text-sm text-gray-500">Based on your search criteria</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredInstitutions.map((result, index) => {
                      const cardDelay = prefersReducedMotion ? 0 : index * 50;
                      return (
                        <div
                          key={result.institution.id}
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
                          <InstitutionCard
                            institution={result.institution}
                            distance={result.distance}
                            showDistance={!!filters.radiusMiles}
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Doctor Results Section (only shown when name search is active) */}
            {showDoctorResults && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-brand-dark-blue">
                    Doctor Results
                  </h2>
                  <p className="text-sm text-gray-500">
                    Individual doctors matching "{filters.name}"
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {doctorMatches!.map((doctor, index) => {
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
                        <DoctorCard doctor={doctor} showInstitution={true} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <GenericCTASection />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function PracticesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-brand-dark-blue text-lg">Loading practices directory...</p>
        </div>
      </div>
    }>
      <PracticesPageContent />
    </Suspense>
  );
}
