'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PracticeResultsHeaderProps {
  total: number;
  sort?: 'relevance' | 'name' | 'distance';
  onSortChange?: (sort: 'relevance' | 'name' | 'distance') => void;
  activeFilters?: {
    query?: string;
    city?: string;
    state?: string;
    zip?: string;
    specialty?: string;
    insurance?: string;
    service?: string;
    distance?: string;
    origin?: string;
  };
  onFilterRemove?: (filterKey: string) => void;
}

export function PracticeResultsHeader({
  total,
  sort = 'relevance',
  onSortChange,
  activeFilters = {},
  onFilterRemove,
}: PracticeResultsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const newSort = value as 'relevance' | 'name' | 'distance';
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/practices?${params.toString()}`);
    onSortChange?.(newSort);
  };

  const handleFilterRemove = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'distance') {
      params.delete('distance');
      params.delete('radius'); // Also remove 'radius' for backward compatibility
    } else if (key === 'origin') {
      params.delete('origin');
      params.delete('olat');
      params.delete('olng');
      params.delete('zip');
      // Reset sort if it's distance
      if (params.get('sort') === 'distance') {
        params.set('sort', 'relevance');
      }
    } else {
      params.delete(key);
    }
    router.push(`/practices?${params.toString()}`);
    onFilterRemove?.(key);
  };

  const hasActiveFilters = Object.values(activeFilters).some((value) => value && value !== 'all');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-brand-dark-blue">
          {total} {total === 1 ? 'Practice' : 'Practices'} found
        </h2>
        <p className="text-sm text-gray-500 mt-1">Based on your search criteria</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {activeFilters.query}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('query')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.city && (
              <Badge variant="secondary" className="flex items-center gap-1">
                City: {activeFilters.city}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('city')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.state && (
              <Badge variant="secondary" className="flex items-center gap-1">
                State: {activeFilters.state}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('state')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.zip && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ZIP: {activeFilters.zip}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('zip')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.specialty && activeFilters.specialty !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Specialty: {activeFilters.specialty}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('specialty')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.insurance && activeFilters.insurance !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Insurance: {activeFilters.insurance}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('insurance')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.service && activeFilters.service !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Service: {activeFilters.service}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('service')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.distance && activeFilters.distance !== 'none' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Within: {activeFilters.distance} mi
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterRemove('distance')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.origin && (
              <Badge variant="secondary" className="flex items-center gap-1">
                From: {activeFilters.origin}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    handleFilterRemove('origin');
                    handleFilterRemove('olat');
                    handleFilterRemove('olng');
                    handleFilterRemove('zip');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">
            Sort by:
          </label>
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger id="sort-select" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              {activeFilters?.origin && (
                <SelectItem value="distance">Distance (nearest)</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
