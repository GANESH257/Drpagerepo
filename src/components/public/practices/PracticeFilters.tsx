'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { departments } from '@/data/departments';
import { doctors } from '@/data/doctors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X, Search, MapPin, UserSearch, Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/lib/useGeolocation';
import { getPracticeFilterOptions, getAllPractices } from '@/lib/services/practiceDirectoryService';
import { geocodeZip } from '@/lib/services/geocodingService';
import { toast } from '@/lib/toast';

// Get unique values from doctors data (fallback for SSR/edge cases)
const allStates = Array.from(
  new Set(doctors.flatMap((d) => d.locations.map((l) => l.state)))
).sort();

const allInsurance = Array.from(
  new Set(doctors.flatMap((d) => d.insurance.map((i) => i.name)))
).sort();

const radiusOptions = [
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
  { value: '100', label: '100 miles' },
];

function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getSearchParam = useCallback((key: string, defaultValue: string = '') => {
    try {
      return searchParams?.get(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  }, [searchParams]);

  // Check if origin exists (olat/olng)
  const hasOrigin = useMemo(() => {
    const olat = parseFloat(getSearchParam('olat', ''));
    const olng = parseFloat(getSearchParam('olng', ''));
    return !isNaN(olat) && !isNaN(olng) && olat !== 0 && olng !== 0;
  }, [searchParams, getSearchParam]);

  const [filters, setFilters] = useState({
    specialty: getSearchParam('specialty', 'all'),
    location: getSearchParam('location', ''),
    insurance: getSearchParam('insurance', 'all'),
    service: getSearchParam('service', 'all'),
    name: getSearchParam('name', ''),
    availability: getSearchParam('availability', 'all'),
    sort: getSearchParam('sort', 'relevance'),
    radiusMiles: getSearchParam('distance', '') || 'none',
  });

  // Separate state for text inputs
  const [nameInput, setNameInput] = useState(() => getSearchParam('name', ''));
  const [locationInput, setLocationInput] = useState(() => getSearchParam('location', ''));

  // Sync state with URL when SearchParams change
  useEffect(() => {
    const newFilters = {
      specialty: getSearchParam('specialty', 'all'),
      location: getSearchParam('location', ''),
      insurance: getSearchParam('insurance', 'all'),
      service: getSearchParam('service', 'all'),
      name: getSearchParam('name', ''),
      availability: getSearchParam('availability', 'all'),
      sort: getSearchParam('sort', 'relevance'),
      radiusMiles: getSearchParam('distance', '') || 'none',
    };
    
    // Only update if filters actually changed to prevent infinite loops
    const filtersChanged = 
      filters.specialty !== newFilters.specialty ||
      filters.location !== newFilters.location ||
      filters.insurance !== newFilters.insurance ||
      filters.service !== newFilters.service ||
      filters.name !== newFilters.name ||
      filters.availability !== newFilters.availability ||
      filters.sort !== newFilters.sort ||
      filters.radiusMiles !== newFilters.radiusMiles;
    
    if (filtersChanged) {
      setFilters(newFilters);
    }
    
    const newNameInput = getSearchParam('name', '');
    const newLocationInput = getSearchParam('location', '');
    
    if (nameInput !== newNameInput) {
      setNameInput(newNameInput);
    }
    if (locationInput !== newLocationInput) {
      setLocationInput(newLocationInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && key !== 'radiusMiles') {
        params.set(key, value);
      }
      if (key === 'radiusMiles' && value && value !== 'none') {
        params.set('distance', value); // Use 'distance' param name
      }
    });
    router.replace(`/practices?${params.toString()}`, { scroll: false });
  };

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const setAllFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      specialty: 'all',
      location: '',
      insurance: 'all',
      service: 'all',
      name: '',
      availability: 'all',
      sort: 'relevance',
      radiusMiles: 'none',
    };
    setFilters(clearedFilters);
    setNameInput('');
    setLocationInput('');
    // Convert 'none' to empty string for URL
    const urlFilters = { ...clearedFilters, radiusMiles: '' };
    updateURL(urlFilters);
  }, [router]);

  return {
    filters,
    nameInput,
    setNameInput,
    locationInput,
    setLocationInput,
    updateFilter,
    setAllFilters,
    clearFilters,
    router,
    hasOrigin,
    getSearchParam,
  };
}

export function TopSearchBar() {
  const { filters, nameInput, setNameInput, locationInput, setLocationInput, updateFilter, router } = useFilters();
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [specialtyInput, setSpecialtyInput] = useState(filters.specialty || 'all');
  const { lat, lng, loading, error, requestLocation, permissionDenied } = useGeolocation();
  
  // Load dynamic filter options
  const [filterOptions, setFilterOptions] = useState<ReturnType<typeof getPracticeFilterOptions>>({
    specialties: [],
    states: [],
    insurances: [],
    services: [],
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const options = getPracticeFilterOptions();
      setFilterOptions(options);
    }
  }, []);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Sync specialtyInput with filters.specialty when URL params change
  useEffect(() => {
    setSpecialtyInput(filters.specialty || 'all');
  }, [filters.specialty]);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (nameInput.trim()) params.set('name', nameInput.trim());
    if (specialtyInput && specialtyInput !== 'all') params.set('specialty', specialtyInput);
    
    // Handle location/ZIP input
    if (locationInput.trim()) {
      params.set('location', locationInput.trim());
      // Try to geocode ZIP if it looks like a ZIP code
      const zipPattern = /^\d{5}(-\d{4})?$/;
      if (zipPattern.test(locationInput.trim())) {
        try {
          const coords = await geocodeZip(locationInput.trim());
          params.set('zip', locationInput.trim());
          params.set('olat', coords.lat.toString());
          params.set('olng', coords.lng.toString());
          // Remove origin=geo if ZIP is provided
          params.delete('origin');
        } catch (error) {
          console.error('Geocoding error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to geocode ZIP code';
          toast.error(errorMessage);
          // Continue with search even if geocoding fails (just won't have origin coordinates)
          // User can still search by location text, just won't get distance features
        }
      }
    }

    if (filters.radiusMiles && filters.radiusMiles !== 'none') {
      params.set('distance', filters.radiusMiles);
    }

    router.push(`/practices?${params.toString()}`);
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyInput(value);
    updateFilter('specialty', value);
  };

  const handleUseLocation = async () => {
    if (lat !== null && lng !== null) {
      // Already have location, set origin params and search
      const params = new URLSearchParams();
      if (nameInput.trim()) params.set('name', nameInput.trim());
      if (specialtyInput && specialtyInput !== 'all') params.set('specialty', specialtyInput);
      if (locationInput.trim()) params.set('location', locationInput.trim());
      if (filters.radiusMiles && filters.radiusMiles !== 'none') {
        params.set('distance', filters.radiusMiles);
      }
      params.set('origin', 'geo');
      params.set('olat', lat.toString());
      params.set('olng', lng.toString());
      // Clear zip if geolocation is used
      params.delete('zip');
      router.push(`/practices?${params.toString()}`);
    } else {
      // Request location
      requestLocation();
    }
  };

  // When geolocation is obtained, update URL
  useEffect(() => {
    if (lat !== null && lng !== null && filters.radiusMiles && filters.radiusMiles !== 'none') {
      const params = new URLSearchParams(window.location.search);
      params.set('origin', 'geo');
      params.set('olat', lat.toString());
      params.set('olng', lng.toString());
      params.delete('zip'); // Clear zip if geolocation is used
      router.replace(`/practices?${params.toString()}`, { scroll: false });
    }
  }, [lat, lng, filters.radiusMiles, router]);

  return (
    <div className="w-full max-w-5xl mx-auto mb-10 px-2 lg:px-0">
      <div className="bg-white backdrop-blur-xl rounded-xl lg:rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-2 border-brand-dark-blue/20 ring-2 ring-brand-teal/10 p-1 lg:p-1.5 flex flex-col lg:flex-row items-stretch gap-1 lg:gap-0 transition-all duration-500 hover:shadow-[0_25px_50px_rgba(15,95,168,0.2)] hover:border-brand-dark-blue/30 hover:ring-brand-teal/20 group/bar">
        {/* Specialty Dropdown */}
        <div className={cn(
          "flex-1 flex items-center px-4 py-2 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-100 transition-all duration-500 rounded-t-lg lg:rounded-l-[1.5rem] lg:rounded-tr-none",
          isFocused === 'specialty' ? "bg-brand-teal/5 shadow-inner" : "hover:bg-gray-50/50"
        )}>
          <Filter className={cn(
            "h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4 transition-all duration-500",
            isFocused === 'specialty' ? "text-brand-teal scale-110 animate-[floating_2s_ease-in-out_infinite]" : "text-gray-400"
          )} />
          <div className="flex-1 min-w-0">
            <label className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-0">Specialty</label>
            <Select
              value={specialtyInput}
              onValueChange={handleSpecialtyChange}
              onOpenChange={(open) => setIsFocused(open ? 'specialty' : null)}
              disabled={filterOptions.specialties.length === 0 && departments.length === 0}
            >
              <SelectTrigger className="w-full bg-transparent border-none focus:ring-0 focus:ring-offset-0 p-0 h-auto font-bold text-sm lg:text-base text-gray-800 [&>span]:text-gray-800 [&>span]:placeholder:text-gray-400">
                <SelectValue placeholder={filterOptions.specialties.length === 0 && departments.length === 0 ? "No specialties available" : "Select specialty"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {(filterOptions.specialties.length > 0 ? filterOptions.specialties : departments.map(d => d.name)).map((specialty) => {
                  // Use slug if it's from departments, otherwise use specialty name as slug
                  const slug = departments.find(d => d.name === specialty)?.slug || specialty.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <SelectItem key={specialty} value={slug}>
                      {specialty}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Practice/Doctor Name Search */}
        <div className={cn(
          "flex-1 flex items-center px-4 py-2 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-100 transition-all duration-500",
          isFocused === 'name' ? "bg-brand-teal/5 shadow-inner" : "hover:bg-gray-50/50"
        )}>
          <UserSearch className={cn(
            "h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4 transition-all duration-500",
            isFocused === 'name' ? "text-brand-teal scale-110 animate-[floating_2s_ease-in-out_infinite]" : "text-gray-400"
          )} />
          <div className="flex-1 min-w-0">
            <label className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-0">Practice or Doctor</label>
            <input
              type="text"
              placeholder="Practice name or doctor name"
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder:text-gray-400 font-bold text-sm lg:text-base p-0"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onFocus={() => setIsFocused('name')}
              onBlur={() => setIsFocused(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Location Search */}
        <div className={cn(
          "flex-1 flex items-center px-4 py-2 lg:py-0 transition-all duration-500 rounded-b-lg lg:rounded-r-[1.5rem] lg:rounded-bl-none",
          isFocused === 'location' ? "bg-brand-teal/5 shadow-inner" : "hover:bg-gray-50/50"
        )}>
          <MapPin className={cn(
            "h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4 transition-all duration-500",
            isFocused === 'location' ? "text-brand-teal scale-110 animate-[floating_2s_ease-in-out_infinite]" : "text-gray-400"
          )} />
          <div className="flex-1 min-w-0">
            <label className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-0">
              {filters.radiusMiles && filters.radiusMiles !== 'none' ? 'ZIP Code' : 'Location'}
            </label>
            <input
              type="text"
              placeholder={filters.radiusMiles && filters.radiusMiles !== 'none' ? 'Enter ZIP code' : 'Zip or city'}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder:text-gray-400 font-bold text-sm lg:text-base p-0"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onFocus={() => setIsFocused('location')}
              onBlur={() => setIsFocused(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="lg:pl-2 flex items-center p-1">
          <button
            onClick={handleSearch}
            className="relative overflow-hidden bg-brand-teal hover:bg-brand-dark-blue text-white font-black h-10 w-full lg:w-12 lg:h-12 rounded-lg lg:rounded-full transition-all duration-500 flex items-center justify-center group/btn shadow-[0_8px_15px_rgba(45,212,191,0.2)] hover:shadow-[0_12px_25px_rgba(45,212,191,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] transition-transform" />
            <Search className="h-5 w-5 group-hover/btn:rotate-12 transition-transform duration-300" />
            <span className="lg:hidden ml-2 font-bold uppercase text-xs tracking-widest">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SidebarFilters({ className }: { className?: string }) {
  const { filters, updateFilter, clearFilters, hasOrigin, getSearchParam } = useFilters();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lat, lng, loading, error, requestLocation, permissionDenied, clearError } = useGeolocation();
  const router = useRouter();
  
  // Get origin label for display
  const originLabel = useMemo(() => {
    const zip = getSearchParam('zip', '');
    const originType = getSearchParam('origin', '');
    if (zip) return zip;
    if (originType === 'geo') return 'your location';
    return null;
  }, [getSearchParam]);
  
  // Load dynamic filter options
  const [filterOptions, setFilterOptions] = useState<ReturnType<typeof getPracticeFilterOptions>>({
    specialties: [],
    states: [],
    insurances: [],
    services: [],
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const options = getPracticeFilterOptions();
      setFilterOptions(options);
    }
  }, []);
  
  // Compute counts for specialties, insurances, and services
  const [specialtyCounts, setSpecialtyCounts] = useState<Record<string, number>>({});
  const [insuranceCounts, setInsuranceCounts] = useState<Record<string, number>>({});
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 
        (filterOptions.specialties.length > 0 || filterOptions.insurances.length > 0 || filterOptions.services.length > 0)) {
      const allPractices = getAllPractices();
      const counts: Record<string, number> = {};
      const insCounts: Record<string, number> = {};
      const servCounts: Record<string, number> = {};
      
      // Single pass through practices for better performance (O(n) instead of O(n*m))
      allPractices.forEach((practice) => {
        // Count specialties (case-insensitive)
        practice.specialties.forEach((spec) => {
          const specLower = spec.toLowerCase();
          // Find matching specialty from filterOptions (case-insensitive)
          const matchingSpec = filterOptions.specialties.find(s => s.toLowerCase() === specLower);
          if (matchingSpec) {
            counts[matchingSpec] = (counts[matchingSpec] || 0) + 1;
          }
        });
        
        // Count insurances (case-insensitive)
        practice.insurance?.forEach((ins) => {
          const insLower = ins.name.toLowerCase();
          // Find matching insurance from filterOptions (case-insensitive)
          const matchingIns = filterOptions.insurances.find(i => i.toLowerCase() === insLower);
          if (matchingIns) {
            insCounts[matchingIns] = (insCounts[matchingIns] || 0) + 1;
          }
        });
        
        // Count services (case-insensitive)
        practice.services?.forEach((service) => {
          const serviceLower = service.toLowerCase();
          // Find matching service from filterOptions (case-insensitive)
          const matchingService = filterOptions.services.find(s => s.toLowerCase() === serviceLower);
          if (matchingService) {
            servCounts[matchingService] = (servCounts[matchingService] || 0) + 1;
          }
        });
      });
      
      setSpecialtyCounts(counts);
      setInsuranceCounts(insCounts);
      setServiceCounts(servCounts);
    }
  }, [filterOptions]);

  const hasActiveFilters =
    (filters.insurance && filters.insurance !== 'all') ||
    (filters.service && filters.service !== 'all') ||
    (filters.availability && filters.availability !== 'all') ||
    (filters.specialty && filters.specialty !== 'all') ||
    (filters.radiusMiles && filters.radiusMiles !== 'none');

  const handleRadiusChange = (value: string) => {
    // Convert 'none' back to empty string for filter
    const radiusValue = value === 'none' ? '' : value;
    const params = new URLSearchParams(window.location.search);
    
    if (radiusValue && radiusValue !== 'none') {
      params.set('distance', radiusValue);
      // If no origin exists, request geolocation
      if (!hasOrigin && lat === null && lng === null && !loading) {
        requestLocation();
      }
    } else {
      params.delete('distance');
    }
    
    router.replace(`/practices?${params.toString()}`, { scroll: false });
  };

  const handleUseMyLocation = async () => {
    if (lat !== null && lng !== null) {
      // Already have location, set origin params
      const params = new URLSearchParams(window.location.search);
      params.set('origin', 'geo');
      params.set('olat', lat.toString());
      params.set('olng', lng.toString());
      params.delete('zip'); // Clear zip if geolocation is used
      router.replace(`/practices?${params.toString()}`, { scroll: false });
      toast.success('Using your location');
    } else {
      requestLocation();
    }
  };

  // When geolocation is obtained, update URL
  useEffect(() => {
    if (lat !== null && lng !== null && !hasOrigin) {
      const params = new URLSearchParams(window.location.search);
      params.set('origin', 'geo');
      params.set('olat', lat.toString());
      params.set('olng', lng.toString());
      params.delete('zip');
      router.replace(`/practices?${params.toString()}`, { scroll: false });
    }
  }, [lat, lng, hasOrigin, router]);

  const handleClearOrigin = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('origin');
    params.delete('olat');
    params.delete('olng');
    params.delete('zip');
    params.delete('distance');
    // Reset sort if it's distance
    if (params.get('sort') === 'distance') {
      params.set('sort', 'relevance');
    }
    router.replace(`/practices?${params.toString()}`, { scroll: false });
  };

  const FilterContent = (
    <div className="space-y-6">
      {/* Specialty */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Specialty</label>
        <Select
          value={filters.specialty || 'all'}
          onValueChange={(value) => updateFilter('specialty', value)}
          disabled={filterOptions.specialties.length === 0 && departments.length === 0}
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder={filterOptions.specialties.length === 0 && departments.length === 0 ? "No specialties available" : "All Specialties"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {(filterOptions.specialties.length > 0 ? filterOptions.specialties : departments.map(d => d.name)).map((specialty) => {
              const slug = departments.find(d => d.name === specialty)?.slug || specialty.toLowerCase().replace(/\s+/g, '-');
              const count = specialtyCounts[specialty] || 0;
              return (
                <SelectItem key={specialty} value={slug}>
                  {specialty}{count > 0 ? ` (${count})` : ''}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Origin Selection */}
      {originLabel && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Origin: {originLabel}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearOrigin}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Radius Search */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Distance</label>
        <Select
          value={getSearchParam('distance', 'none')}
          onValueChange={handleRadiusChange}
          disabled={!hasOrigin}
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder={hasOrigin ? "No radius limit" : "Set an origin to use distance filters"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No radius limit</SelectItem>
            {radiusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!hasOrigin && (
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={loading || (lat !== null && lng !== null)}
              className="w-full text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Getting location...
                </>
              ) : lat !== null && lng !== null ? (
                <>
                  <Navigation className="h-3 w-3 mr-2" />
                  Location found
                </>
              ) : permissionDenied ? (
                'Enter ZIP code in search'
              ) : (
                <>
                  <Navigation className="h-3 w-3 mr-2" />
                  Use my location
                </>
              )}
            </Button>
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Insurance */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Insurance</label>
        <Select
          value={filters.insurance || 'all'}
          onValueChange={(value) => updateFilter('insurance', value)}
          disabled={filterOptions.insurances.length === 0 && allInsurance.length === 0}
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder={filterOptions.insurances.length === 0 && allInsurance.length === 0 ? "No insurance options available" : "All Insurance"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Insurance</SelectItem>
            {(filterOptions.insurances.length > 0 ? filterOptions.insurances : allInsurance).map((ins) => {
              const count = insuranceCounts[ins] || 0;
              return (
                <SelectItem key={ins} value={ins}>
                  {ins}{count > 0 ? ` (${count})` : ''}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Services */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Services</label>
        <Select
          value={filters.service || 'all'}
          onValueChange={(value) => updateFilter('service', value === 'all' ? 'all' : value)}
          disabled={filterOptions.services.length === 0}
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder={filterOptions.services.length === 0 ? "No services available" : "All Services"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {filterOptions.services.map((service) => {
              const count = serviceCounts[service] || 0;
              return (
                <SelectItem key={service} value={service}>
                  {service}{count > 0 ? ` (${count})` : ''}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Availability */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Availability</label>
        <Select
          value={filters.availability || 'all'}
          onValueChange={(value) => updateFilter('availability', value)}
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="this-week">This week</SelectItem>
            <SelectItem value="next-week">Next week</SelectItem>
            <SelectItem value="this-month">This month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sorting */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Sort Results</label>
        <Select
          value={getSearchParam('sort', 'relevance')}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger className="bg-white/50 border-gray-200 focus:ring-brand-teal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hasOrigin && (
              <SelectItem value="distance">Distance (nearest)</SelectItem>
            )}
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-4"
        >
          <X className="h-4 w-4 mr-2" />
          Reset All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('hidden md:block', className)}>
        <div className="sticky top-24 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-brand-dark-blue flex items-center gap-2">
              <Filter className="h-5 w-5 text-brand-teal" />
              Refine Search
            </h3>
          </div>
          {FilterContent}
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden mb-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full bg-white border-gray-200 h-12 rounded-xl text-gray-700 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-brand-teal" />
              Filters & Sorting
              {hasActiveFilters && (
                <span className="ml-2 bg-brand-teal text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                  Active
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                <Filter className="h-6 w-6 text-brand-teal" />
                Refine Search
              </SheetTitle>
              <SheetDescription>
                Narrow down results to find the perfect practice.
              </SheetDescription>
            </SheetHeader>
            {FilterContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
