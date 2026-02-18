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

// Get unique values from doctors data
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

  const [filters, setFilters] = useState({
    specialty: getSearchParam('specialty', 'all'),
    location: getSearchParam('location', ''),
    insurance: getSearchParam('insurance', 'all'),
    name: getSearchParam('name', ''),
    availability: getSearchParam('availability', 'all'),
    sort: getSearchParam('sort', 'rating-desc'),
    radiusMiles: getSearchParam('radius', '') || 'none',
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
      name: getSearchParam('name', ''),
      availability: getSearchParam('availability', 'all'),
      sort: getSearchParam('sort', 'rating-desc'),
      radiusMiles: getSearchParam('radius', '') || 'none',
    };
    
    // Only update if filters actually changed to prevent infinite loops
    const filtersChanged = 
      filters.specialty !== newFilters.specialty ||
      filters.location !== newFilters.location ||
      filters.insurance !== newFilters.insurance ||
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
        params.set('radius', value);
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
      name: '',
      availability: 'all',
      sort: 'rating-desc',
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
  };
}

export function TopSearchBar() {
  const { filters, nameInput, setNameInput, locationInput, setLocationInput, updateFilter, router } = useFilters();
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [specialtyInput, setSpecialtyInput] = useState(filters.specialty || 'all');
  const { lat, lng, loading, error, requestLocation, permissionDenied } = useGeolocation();

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Sync specialtyInput with filters.specialty when URL params change
  useEffect(() => {
    setSpecialtyInput(filters.specialty || 'all');
  }, [filters.specialty]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (nameInput.trim()) params.set('name', nameInput.trim());
    if (specialtyInput && specialtyInput !== 'all') params.set('specialty', specialtyInput);
    if (locationInput.trim()) params.set('location', locationInput.trim());
    if (filters.radiusMiles && filters.radiusMiles !== 'none') {
      params.set('radius', filters.radiusMiles);
    }

    // If radius is set and we have geolocation (and no ZIP), add lat/lng
    if (filters.radiusMiles && filters.radiusMiles !== 'none' && !locationInput.trim() && lat !== null && lng !== null) {
      params.set('userLat', lat.toString());
      params.set('userLng', lng.toString());
    }

    router.push(`/practices?${params.toString()}`);
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyInput(value);
    updateFilter('specialty', value);
  };

  const handleUseLocation = () => {
    if (lat !== null && lng !== null) {
      // Already have location, use it
      handleSearch();
    } else {
      // Request location
      requestLocation();
    }
  };

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
            >
              <SelectTrigger className="w-full bg-transparent border-none focus:ring-0 focus:ring-offset-0 p-0 h-auto font-bold text-sm lg:text-base text-gray-800 [&>span]:text-gray-800 [&>span]:placeholder:text-gray-400">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.slug} value={dept.slug}>
                    {dept.name}
                  </SelectItem>
                ))}
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
  const { filters, updateFilter, clearFilters } = useFilters();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lat, lng, loading, error, requestLocation, permissionDenied, clearError } = useGeolocation();

  const hasActiveFilters =
    (filters.insurance && filters.insurance !== 'all') ||
    (filters.availability && filters.availability !== 'all') ||
    (filters.specialty && filters.specialty !== 'all') ||
    (filters.radiusMiles && filters.radiusMiles !== 'none');

  const handleRadiusChange = (value: string) => {
    // Convert 'none' back to empty string for filter
    const radiusValue = value === 'none' ? '' : value;
    updateFilter('radiusMiles', radiusValue);
    
    // If radius is set and no ZIP provided, request geolocation
    if (radiusValue && !filters.location && lat === null && lng === null && !loading) {
      requestLocation();
    }
  };

  const FilterContent = (
    <div className="space-y-6">
      {/* Specialty */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Specialty</label>
        <Select
          value={filters.specialty || 'all'}
          onValueChange={(value) => updateFilter('specialty', value)}
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.slug} value={dept.slug}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Radius Search */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Search Radius</label>
        <Select
          value={filters.radiusMiles || 'none'}
          onValueChange={handleRadiusChange}
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder="No radius limit" />
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
        {filters.radiusMiles && filters.radiusMiles !== 'none' && !filters.location && (
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={requestLocation}
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
                'Enter ZIP code'
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
        >
          <SelectTrigger className="bg-white/50 border-gray-200">
            <SelectValue placeholder="All Insurance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Insurance</SelectItem>
            {allInsurance.map((ins) => (
              <SelectItem key={ins} value={ins}>
                {ins}
              </SelectItem>
            ))}
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
          value={filters.sort}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger className="bg-white/50 border-gray-200 focus:ring-brand-teal">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.radiusMiles ? (
              <SelectItem value="distance">Distance (nearest first)</SelectItem>
            ) : null}
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
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
