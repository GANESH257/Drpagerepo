'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { PracticeCard } from '@/components/public/practices/PracticeCard';
import { PracticeResultsHeader } from '@/components/public/practices/PracticeResultsHeader';
import { SidebarFilters, TopSearchBar } from '@/components/PracticeFilters';
import { GenericCTASection } from '@/components/GenericCTASection';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Search } from 'lucide-react';
import { searchPractices, PracticeSearchFilters, PracticeSearchResult, getDoctorsForPractice } from '@/lib/services/practiceDirectoryService';
import { Doctor, Practice } from '@/types';
import { Button } from '@/components/ui/button';

// Dynamically import map component with SSR disabled
const PracticeMap = dynamic(
  () => import('@/components/public/practices/PracticeMap').then((mod) => ({ default: mod.PracticeMap })),
  { ssr: false }
);

/**
 * Derive specialties from doctors in a practice
 * Normalizes, deduplicates, and sorts specialties
 */
function deriveSpecialtiesFromDoctors(doctors: Doctor[]): string[] {
  const specialtiesSet = new Set<string>();
  
  doctors.forEach(doctor => {
    // Add primary specialty
    if (doctor.specialty && doctor.specialty.trim()) {
      specialtiesSet.add(doctor.specialty.trim());
    }
    // Add all specialties array
    if (doctor.specialties && Array.isArray(doctor.specialties)) {
      doctor.specialties.forEach(spec => {
        if (spec && spec.trim()) {
          specialtiesSet.add(spec.trim());
        }
      });
    }
  });
  
  // Return sorted array
  return Array.from(specialtiesSet).sort();
}

function PracticesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<PracticeSearchResult>({ 
    practices: [], 
    total: 0, 
    page: 1, 
    pageSize: 12, 
    hasMore: false 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | undefined>();
  const [practicesWithDerivedSpecialties, setPracticesWithDerivedSpecialties] = useState<Array<Practice & { derivedSpecialties: string[]; distanceMiles?: number }>>([]);

  const getSearchParam = (key: string, defaultValue: string = '') => {
    try {
      return searchParams?.get(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Parse origin from URL params
  const origin = useMemo(() => {
    const olat = parseFloat(getSearchParam('olat', ''));
    const olng = parseFloat(getSearchParam('olng', ''));
    const zip = getSearchParam('zip', '');
    const originType = getSearchParam('origin', '');
    
    if (olat && olng && !isNaN(olat) && !isNaN(olng)) {
      const label = zip || (originType === 'geo' ? 'your location' : '');
      return { lat: olat, lng: olng, label };
    }
    return undefined;
  }, [searchParams]);

  const filters = useMemo(
    (): PracticeSearchFilters => ({
      query: getSearchParam('name', '') || undefined,
      city: getSearchParam('city', '') || undefined,
      state: getSearchParam('state', '') || undefined,
      zip: getSearchParam('location', '') || undefined, // Map 'location' param to 'zip'
      specialty: getSearchParam('specialty', '') || undefined,
      insurance: getSearchParam('insurance', '') || undefined,
      service: getSearchParam('service', '') || undefined,
      sort: (getSearchParam('sort', 'relevance') as 'relevance' | 'name' | 'distance') || 'relevance',
      page: parseInt(getSearchParam('page', '1'), 10) || 1,
      pageSize: 12,
      origin,
      radiusMiles: (() => {
        const radius = getSearchParam('distance', '') || getSearchParam('radius', '');
        return radius && radius !== 'none' ? parseFloat(radius) : null;
      })(),
    }),
    [searchParams, origin]
  );

  useEffect(() => {
    // Reset to page 1 when filters change (except page)
    const { page, ...otherFilters } = filters;
    const hasFilterChanges = Object.values(otherFilters).some((v) => v && v !== 'all' && v !== undefined);
    if (hasFilterChanges && currentPage !== 1) {
      setCurrentPage(1);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      router.replace(`/practices?${params.toString()}`, { scroll: false });
    }
  }, [filters.query, filters.city, filters.state, filters.zip, filters.specialty, filters.insurance, filters.service, filters.sort]);

  useEffect(() => {
    // Update currentPage from URL
    const pageParam = parseInt(getSearchParam('page', '1'), 10);
    if (pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function performSearch() {
      // Perform search with current filters
      const results = await searchPractices({
        ...filters,
        page: currentPage,
      });
      setSearchResults(results);
    }
    performSearch();
  }, [filters, currentPage]);

  // Compute derived specialties for each practice in results
  useEffect(() => {
    async function computeDerivedSpecialties() {
      const practicesWithSpecialties = await Promise.all(
        searchResults.practices.map(async (practice) => {
          const practiceDoctors = await getDoctorsForPractice(practice.id);
          const derivedSpecialties = practiceDoctors.length > 0
            ? deriveSpecialtiesFromDoctors(practiceDoctors)
            : (practice.specialties || []); // Fallback to practice.specialties
          return { ...practice, derivedSpecialties };
        })
      );
      setPracticesWithDerivedSpecialties(practicesWithSpecialties);
    }
    computeDerivedSpecialties();
  }, [searchResults.practices]);

  // Handle practice selection (from list or map)
  const handleSelectPractice = (practiceId: string) => {
    setSelectedPracticeId(practiceId);
    // Scroll to practice card
    const element = document.getElementById(`practice-${practiceId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', nextPage.toString());
    router.push(`/practices?${params.toString()}`, { scroll: false });
  };

  const hasMore = searchResults.hasMore;
  const activeFilters = {
    query: filters.query,
    city: filters.city,
    state: filters.state,
    zip: filters.zip,
    specialty: filters.specialty,
    insurance: filters.insurance,
    service: filters.service,
    distance: filters.radiusMiles ? filters.radiusMiles.toString() : undefined,
    origin: origin?.label,
  };

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

        {/* Map at Top */}
        {searchResults.practices.length > 0 && (
          <div
            className="mb-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.2s',
            }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-lg font-semibold text-brand-dark-blue mb-4">Map View</h3>
              <div className="h-[500px] w-full">
                <PracticeMap
                  practices={searchResults.practices}
                  origin={searchResults.origin}
                  selectedPracticeId={selectedPracticeId}
                  onSelectPractice={handleSelectPractice}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className="lg:w-72 flex-shrink-0"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible && !prefersReducedMotion ? 'translateX(0)' : 'translateX(-30px)',
              transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
            }}
          >
            <SidebarFilters />
          </aside>

          {/* Results List */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              {searchResults.practices.length === 0 ? (
                <div
                  className="text-center py-12"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 0.6s ease-out 0.4s',
                  }}
                >
                  <EmptyState
                    title="No practices found"
                    description={
                      filters.zip || filters.city || filters.state
                        ? 'We couldn\'t find any practices matching your current filters. Try adjusting your search criteria.'
                        : 'Start by entering a location or specialty to find practices near you.'
                    }
                    icon={<Search className="h-10 w-10 text-gray-300" />}
                    action={
                      <Button
                        variant="outline"
                        onClick={() => router.push('/practices')}
                        className="mt-4"
                      >
                        Clear all filters
                      </Button>
                    }
                  />
                </div>
              ) : (
                <>
                  <PracticeResultsHeader
                    total={searchResults.total}
                    sort={filters.sort}
                    activeFilters={activeFilters}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {practicesWithDerivedSpecialties.map((practice, index) => {
                      const cardDelay = prefersReducedMotion ? 0 : index * 50;
                      return (
                        <div
                          key={practice.id}
                          id={`practice-${practice.id}`}
                          onClick={() => handleSelectPractice(practice.id)}
                          className="cursor-pointer"
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
                          <PracticeCard 
                            practice={practice} 
                            distanceMiles={practice.distanceMiles}
                            originLabel={origin?.label}
                            derivedSpecialties={practice.derivedSpecialties}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        className="px-8"
                      >
                        Load More Practices
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        Showing {searchResults.practices.length} of {searchResults.total} practices
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

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
