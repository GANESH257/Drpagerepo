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
import { Filter, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Get unique values from doctors data
const allStates = Array.from(
  new Set(doctors.flatMap((d) => d.locations.map((l) => l.state)))
).sort();

const allInsurance = Array.from(
  new Set(doctors.flatMap((d) => d.insurance.map((i) => i.name)))
).sort();

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function DoctorFilters({
  onFilterChange,
  className,
}: {
  onFilterChange?: (filters: any) => void;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleNameSearch = () => {
    updateFilter('name', nameInput.trim());
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSearch();
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(e.target.value);
  };

  const handleLocationSearch = () => {
    updateFilter('location', locationInput.trim());
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLocationSearch();
    }
  };

  // Sync inputs when filters change from external sources (like clearFilters)
  useEffect(() => {
    if (filters.name === '' && nameInput !== '') {
      setNameInput('');
    }
    if (filters.location === '' && locationInput !== '') {
      setLocationInput('');
    }
  }, [filters.name, filters.location]);

  // Use ref to prevent unnecessary re-renders from onFilterChange
  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });
    router.replace(`/doctors?${params.toString()}`, { scroll: false });
    onFilterChangeRef.current?.(filters);
  }, [filters, router]);

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
  }, []);

  const hasActiveFilters =
    (filters.specialty && filters.specialty !== 'all') ||
    filters.location ||
    (filters.insurance && filters.insurance !== 'all') ||
    filters.name ||
    filters.lastNamePrefix ||
    (filters.availability && filters.availability !== 'all');

  const FilterContent = useMemo(() => (
    <div className="space-y-4">
      {/* Specialty */}
      <div>
        <label className="text-sm font-medium mb-2 block">Specialty</label>
        <Select
          value={filters.specialty || 'all'}
          onValueChange={(value) => updateFilter('specialty', value)}
        >
          <SelectTrigger>
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

      {/* Location */}
      <div>
        <label className="text-sm font-medium mb-2 block">Location</label>
        <div className="flex gap-2">
          <Input
            placeholder="ZIP code, city, or state"
            value={locationInput}
            onChange={handleLocationChange}
            onKeyDown={handleLocationKeyDown}
            onBlur={handleLocationSearch}
            className="flex-1"
            autoComplete="off"
          />
          <Button
            type="button"
            onClick={handleLocationSearch}
            className="bg-brand-teal hover:bg-brand-teal/90"
            aria-label="Search by location"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {allStates.length > 0 && (
          <Select
            value={filters.location}
            onValueChange={(value) => updateFilter('location', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Or select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {allStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Insurance */}
      <div>
        <label className="text-sm font-medium mb-2 block">Insurance</label>
        <Select
          value={filters.insurance || 'all'}
          onValueChange={(value) => updateFilter('insurance', value)}
        >
          <SelectTrigger>
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

      {/* Provider Name */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Provider Name
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name"
            value={nameInput}
            onChange={handleNameChange}
            onKeyDown={handleNameKeyDown}
            onBlur={handleNameSearch}
            className="flex-1"
            autoComplete="off"
          />
          <Button
            type="button"
            onClick={handleNameSearch}
            className="bg-brand-teal hover:bg-brand-teal/90"
            aria-label="Search by name"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Last Name Prefix */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Last Name Starts With
        </label>
        <div className="flex flex-wrap gap-1">
          {alphabet.map((letter) => (
            <Button
              key={letter}
              variant={
                filters.lastNamePrefix === letter ? 'default' : 'outline'
              }
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                updateFilter(
                  'lastNamePrefix',
                  filters.lastNamePrefix === letter ? '' : letter
                )
              }
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="text-sm font-medium mb-2 block">Availability</label>
        <Select
          value={filters.availability || 'all'}
          onValueChange={(value) => updateFilter('availability', value)}
        >
          <SelectTrigger>
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

      {/* Sort */}
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select
          value={filters.sort}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger>
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

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  ), [filters, nameInput, locationInput, hasActiveFilters]);

  return (
    <>
      {/* Desktop Filters */}
      <div className={cn('hidden md:block', className)}>
        <div className="sticky top-20">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          {FilterContent}
        </div>
      </div>

      {/* Mobile Filters */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden w-full">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Filter doctors by specialty, location, insurance, and more.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {FilterContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
