'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDepartments, Department } from '@/lib/api/departments';
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
import { Filter, X, Search, MapPin, UserSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

// These will be loaded from API when needed
// For now, keeping static lists for insurance/states (can be migrated later)
const allStates: string[] = [];
const allInsurance: string[] = [];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getSearchParam = (key: string, defaultValue: string = '') => {
    try {
      return searchParams?.get(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [filters, setFilters] = useState({
    specialty: getSearchParam('specialty', 'all'),
    location: getSearchParam('location', ''),
    insurance: getSearchParam('insurance', 'all'),
    name: getSearchParam('name', ''),
    lastNamePrefix: getSearchParam('lastNamePrefix', ''),
    availability: getSearchParam('availability', 'all'),
    sort: getSearchParam('sort', 'rating-desc'),
  });

  // Separate state for text inputs (for manual search to prevent focus loss)
  const [nameInput, setNameInput] = useState(() => getSearchParam('name', ''));
  const [locationInput, setLocationInput] = useState(() => getSearchParam('location', ''));
  const [insuranceInput, setInsuranceInput] = useState(() => getSearchParam('insurance', ''));

  // Sync state with URL when SearchParams change (e.g. browser back/forward)
  useEffect(() => {
    setFilters({
      specialty: getSearchParam('specialty', 'all'),
      location: getSearchParam('location', ''),
      insurance: getSearchParam('insurance', 'all'),
      name: getSearchParam('name', ''),
      lastNamePrefix: getSearchParam('lastNamePrefix', ''),
      availability: getSearchParam('availability', 'all'),
      sort: getSearchParam('sort', 'rating-desc'),
    });
    setNameInput(getSearchParam('name', ''));
    setLocationInput(getSearchParam('location', ''));
    setInsuranceInput(getSearchParam('insurance', 'all') === 'all' ? '' : getSearchParam('insurance', ''));
  }, [searchParams]);

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });
    router.replace(`/doctors?${params.toString()}`, { scroll: false });
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
      lastNamePrefix: '',
      availability: 'all',
      sort: 'rating-desc',
    };
    setFilters(clearedFilters);
    setNameInput('');
    setLocationInput('');
    setInsuranceInput('');
    updateURL(clearedFilters);
  }, [router]);

  return {
    filters,
    nameInput,
    setNameInput,
    locationInput,
    setLocationInput,
    insuranceInput,
    setInsuranceInput,
    updateFilter,
    setAllFilters,
    clearFilters,
    router,
  };
}

export function TopSearchBar() {
  const { filters, nameInput, setNameInput, locationInput, setLocationInput, insuranceInput, setInsuranceInput, updateFilter, router } = useFilters();
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [specialtyInput, setSpecialtyInput] = useState(filters.specialty || 'all');
  const [departments, setDepartments] = useState<Department[]>([]);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Load departments from API
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };
    loadDepartments();
  }, []);


  // Sync specialtyInput with filters.specialty when URL params change
  useEffect(() => {
    setSpecialtyInput(filters.specialty || 'all');
  }, [filters.specialty]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (nameInput.trim()) params.set('name', nameInput.trim());
    if (specialtyInput && specialtyInput !== 'all') params.set('specialty', specialtyInput);
    if (locationInput.trim()) params.set('location', locationInput.trim());

    // Always navigate to /doctors with the params
    router.push(`/doctors?${params.toString()}`);
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyInput(value);
    updateFilter('specialty', value);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-10 px-2 lg:px-0" data-scroll-exclude data-scroll-speed="0">
      <div 
        className="bg-white backdrop-blur-xl rounded-xl lg:rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-2 border-brand-dark-blue/20 p-1 lg:p-1.5 flex flex-col lg:flex-row items-stretch gap-1 lg:gap-0 transition-all duration-500 hover:shadow-[0_25px_50px_rgba(15,95,168,0.2)] hover:border-brand-dark-blue/30 group/bar"
        data-scroll-exclude
        data-scroll-speed="0"
      >
        {/* Specialty Dropdown */}
        <div className={cn(
          "flex-1 flex items-center px-4 py-2 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-100 transition-all duration-500 rounded-t-lg lg:rounded-l-[1.5rem] lg:rounded-tr-none",
          isFocused === 'specialty' ? "bg-brand-teal/5 shadow-inner" : "hover:bg-gray-50/50"
        )}>
          <Filter className={cn(
            "h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4 transition-all duration-300",
            isFocused === 'specialty' ? "text-brand-teal scale-110" : "text-gray-400"
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

        {/* Provider Name Search */}
        <div className={cn(
          "flex-1 flex items-center px-4 py-2 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-100 transition-all duration-500",
          isFocused === 'name' ? "bg-brand-teal/5 shadow-inner" : "hover:bg-gray-50/50"
        )}>
          <UserSearch className={cn(
            "h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4 transition-all duration-300",
            isFocused === 'name' ? "text-brand-teal scale-110" : "text-gray-400"
          )} />
          <div className="flex-1 min-w-0">
            <label className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-0">Provider Name</label>
            <input
              type="text"
              placeholder="Provider Name"
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
            "h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4 transition-all duration-300",
            isFocused === 'location' ? "text-brand-teal scale-110" : "text-gray-400"
          )} />
          <div className="flex-1 min-w-0">
            <label className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-0">Location</label>
            <input
              type="text"
              placeholder="Zip or city"
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder:text-gray-400 font-bold text-sm lg:text-base p-0"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onFocus={() => setIsFocused('location')}
              onBlur={() => setIsFocused(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Search Button - Compact Circle */}
        <div 
          className="lg:pl-2 flex items-center p-1"
          data-scroll-exclude
          data-scroll-speed="0"
          style={{
            transform: 'translate3d(0, 0, 0)',
            willChange: 'auto',
            width: 'fit-content',
            minWidth: 'fit-content',
            maxWidth: 'fit-content',
            flexShrink: 0,
            flexGrow: 0
          } as React.CSSProperties}
        >
          <button
            onClick={handleSearch}
            className="relative overflow-hidden bg-brand-teal hover:bg-brand-dark-blue text-white font-black h-10 w-full lg:w-12 lg:h-12 rounded-lg lg:rounded-full transition-all duration-500 flex items-center justify-center group/btn shadow-[0_4px_12px_rgba(29,212,196,0.25)] hover:shadow-[0_6px_16px_rgba(29,212,196,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            data-scroll-exclude
            data-scroll-speed="0"
            style={{
              transform: 'translate3d(0, 0, 0)',
              willChange: 'auto'
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] transition-transform" />
            <Search className="h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-12" />
            <span className="lg:hidden ml-2 font-bold uppercase text-xs tracking-widest">Search Doctors</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SidebarFilters({ className }: { className?: string }) {
  const { filters, updateFilter, clearFilters } = useFilters();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load departments from API
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };
    loadDepartments();
  }, []);

  // Prevent Locomotive Scroll from affecting sidebar elements
  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new MutationObserver(() => {
      // Force reset transforms on all combobox buttons
      const comboboxes = sidebarRef.current?.querySelectorAll('[role="combobox"]');
      comboboxes?.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.setProperty('transform', 'translate3d(0, 0, 0)', 'important');
        htmlEl.style.setProperty('scale', '1', 'important');
        htmlEl.style.setProperty('rotate', '0deg', 'important');
        htmlEl.style.setProperty('-webkit-transform', 'translate3d(0, 0, 0)', 'important');
      });
    });

    observer.observe(sidebarRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'data-scroll']
    });

    // Also use requestAnimationFrame to continuously reset transforms
    let rafId: number;
    const resetTransforms = () => {
      const comboboxes = sidebarRef.current?.querySelectorAll('[role="combobox"]');
      comboboxes?.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        const transform = computedStyle.transform;
        if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
          htmlEl.style.setProperty('transform', 'translate3d(0, 0, 0)', 'important');
          htmlEl.style.setProperty('scale', '1', 'important');
          htmlEl.style.setProperty('rotate', '0deg', 'important');
        }
      });
      rafId = requestAnimationFrame(resetTransforms);
    };
    rafId = requestAnimationFrame(resetTransforms);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const hasActiveFilters =
    (filters.insurance && filters.insurance !== 'all') ||
    (filters.availability && filters.availability !== 'all') ||
    filters.lastNamePrefix ||
    (filters.specialty && filters.specialty !== 'all');

  const FilterContent = (
    <div className="space-y-6" data-scroll-exclude data-scroll-speed="0" style={{ transform: 'translate3d(0, 0, 0)', willChange: 'auto' } as React.CSSProperties}>
      {/* Specialty - Move to side if needed, or keep for specificity */}
      <div data-scroll-exclude data-scroll-speed="0" style={{ transform: 'translate3d(0, 0, 0)' } as React.CSSProperties}>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Specialty</label>
        <Select
          value={filters.specialty || 'all'}
          onValueChange={(value) => updateFilter('specialty', value)}
          data-scroll-exclude
        >
          <SelectTrigger 
            className="bg-white/50 border-gray-200" 
            data-scroll-speed="0" 
            data-scroll-exclude
            style={{ transform: 'translate3d(0, 0, 0)', scale: '1', rotate: '0deg' } as React.CSSProperties}
          >
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

      {/* Insurance */}
      <div data-scroll-exclude data-scroll-speed="0" style={{ transform: 'translate3d(0, 0, 0)' } as React.CSSProperties}>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Insurance</label>
        <Select
          value={filters.insurance || 'all'}
          onValueChange={(value) => updateFilter('insurance', value)}
          data-scroll-exclude
        >
          <SelectTrigger 
            className="bg-white/50 border-gray-200" 
            data-scroll-speed="0" 
            data-scroll-exclude
            style={{ transform: 'translate3d(0, 0, 0)', scale: '1', rotate: '0deg' } as React.CSSProperties}
          >
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
      <div data-scroll-exclude data-scroll-speed="0" style={{ transform: 'translate3d(0, 0, 0)' } as React.CSSProperties}>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Availability</label>
        <Select
          value={filters.availability || 'all'}
          onValueChange={(value) => updateFilter('availability', value)}
          data-scroll-exclude
        >
          <SelectTrigger 
            className="bg-white/50 border-gray-200" 
            data-scroll-speed="0" 
            data-scroll-exclude
            style={{ transform: 'translate3d(0, 0, 0)', scale: '1', rotate: '0deg' } as React.CSSProperties}
          >
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="this-week">This week</SelectItem>
            <SelectItem value="next-week">Next week</SelectItem>
            <SelectItem value="this-month">This month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sorting */}
      <div data-scroll-exclude data-scroll-speed="0" style={{ transform: 'translate3d(0, 0, 0)' } as React.CSSProperties}>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">Sort Results</label>
        <Select
          value={filters.sort}
          onValueChange={(value) => updateFilter('sort', value)}
          data-scroll-exclude
        >
          <SelectTrigger 
            className="bg-white/50 border-gray-200 focus:ring-brand-teal" 
            data-scroll-speed="0" 
            data-scroll-exclude
            style={{ transform: 'translate3d(0, 0, 0)', scale: '1', rotate: '0deg' } as React.CSSProperties}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating-desc">Highest Rated</SelectItem>
            <SelectItem value="rating-asc">Lowest Rated</SelectItem>
            <SelectItem value="reviews-desc">Most Reviews</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Last Name Prefix */}
      <div data-scroll-exclude>
        <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase tracking-wider">
          Last Name Starts With
        </label>
        <div className="flex flex-wrap gap-1.5" data-scroll-exclude>
          {alphabet.map((letter) => (
            <button
              key={letter}
              className={cn(
                "h-8 w-8 text-xs font-bold rounded-lg transition-all transform active:scale-90",
                filters.lastNamePrefix === letter
                  ? "bg-brand-teal text-white shadow-md shadow-brand-teal/20"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-brand-teal hover:text-brand-teal"
              )}
              onClick={() =>
                updateFilter(
                  'lastNamePrefix',
                  filters.lastNamePrefix === letter ? '' : letter
                )
              }
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div data-scroll-exclude>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-4"
            data-scroll-speed="0"
            data-scroll-exclude
          >
            <X className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('hidden md:block', className)} data-scroll-exclude data-scroll-speed="0" ref={sidebarRef}>
        <div className="sticky top-24 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm" data-scroll-exclude data-scroll-speed="0">
          <div className="flex items-center justify-between mb-6" data-scroll-exclude>
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
                Narrow down results to find the perfect doctor.
              </SheetDescription>
            </SheetHeader>
            {FilterContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Legacy export for compatibility if needed, though we should update page.tsx
export function DoctorFilters({ className }: { className?: string }) {
  return <SidebarFilters className={className} />;
}
