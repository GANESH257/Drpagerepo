'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDoctors } from '@/lib/api/doctors';
import { DoctorCard } from '@/components/DoctorCard';
import { SidebarFilters, TopSearchBar } from '@/components/DoctorFilters';
import { GenericCTASection } from '@/components/GenericCTASection';
import { Doctor } from '@/types';
import { Search } from 'lucide-react';

function DoctorsPageContent() {
  const searchParams = useSearchParams();
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDoctors = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load from API
        const response = await getDoctors();
        const apiDoctors = response.doctors;
        
        if (apiDoctors && apiDoctors.length > 0) {
          // Add original index to preserve order for featured doctors
          const doctorsWithIndex = apiDoctors.map((doctor, index) => ({
            ...doctor,
            originalIndex: index,
          }));
          setAllDoctors(doctorsWithIndex as Doctor[]);
          setFilteredDoctors(doctorsWithIndex as Doctor[]);
        } else {
          setAllDoctors([]);
          setFilteredDoctors([]);
        }
      } catch (error) {
        console.error('Error loading doctors from API:', error);
        setError('Failed to load doctors. Please try again later.');
        setAllDoctors([]);
        setFilteredDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, []);
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
    let result = [...allDoctors];

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

    // Filter by name, specialty, or insurance (Main search box)
    if (filters.name) {
      const searchLower = filters.name.toLowerCase();
      result = result.filter((d) => {
        const matchesName =
          d.firstName.toLowerCase().includes(searchLower) ||
          d.lastName.toLowerCase().includes(searchLower) ||
          d.fullName.toLowerCase().includes(searchLower);

        const matchesSpecialty =
          d.specialty.toLowerCase().includes(searchLower) ||
          (d.specialties && d.specialties.some(s => s.toLowerCase().includes(searchLower)));

        const matchesInsurance =
          d.insurance && d.insurance.some(i => i.name.toLowerCase().includes(searchLower));

        return matchesName || matchesSpecialty || matchesInsurance;
      });
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

      // For featured doctors, preserve original array order
      if (aFeatured && bFeatured) {
        const aIndex = (a as any).originalIndex ?? Infinity;
        const bIndex = (b as any).originalIndex ?? Infinity;
        // If both are featured, maintain original order (Robert first, Amit second)
        if (aIndex !== Infinity && bIndex !== Infinity) {
          return aIndex - bIndex;
        }
      }

      // Then apply selected sort for non-featured doctors
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
  }, [filters, allDoctors]);

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
              Find the Right Doctor
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Book appointments with top-rated independent physicians in your area.
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              {filteredDoctors.length === 0 ? (
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
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No doctors found</h3>
                  <p className="text-gray-500 mb-6">
                    We couldn't find any doctors matching your current filters.
                  </p>
                  <button
                    onClick={() => window.location.href = '/doctors'}
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
                        {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} available
                      </h2>
                      <p className="text-sm text-gray-500">Based on your search criteria</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
            </div>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
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
