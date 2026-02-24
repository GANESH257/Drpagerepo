'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApprovalStatus, ApprovalType } from '@/types/approvals';
import { Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ApprovalTypeBadge } from './ApprovalTypeBadge';

export interface FilterState {
  status?: ApprovalStatus;
  type?: ApprovalType;
  searchQuery?: string;
}

interface SearchAndFilterBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  showTypeFilter?: boolean;
  showStatusFilter?: boolean;
  className?: string;
  requestCounts?: {
    total: number;
    filtered: number;
    byType?: Record<string, number>;
  };
}

export function SearchAndFilterBar({
  onSearch,
  onFilterChange,
  showTypeFilter = true,
  showStatusFilter = true,
  className,
  requestCounts,
}: SearchAndFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'all'>('all');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
    onFilterChange({
      searchQuery: value,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
    });
  };

  const handleStatusChange = (value: ApprovalStatus | 'all') => {
    setStatusFilter(value);
    onFilterChange({
      searchQuery,
      status: value !== 'all' ? value : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
    });
  };

  const handleTypeChange = (value: ApprovalType | 'all') => {
    setTypeFilter(value);
    onFilterChange({
      searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: value !== 'all' ? value : undefined,
    });
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by practice name, doctor name, or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {showStatusFilter && (
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
        {showTypeFilter && (
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="new_practice_with_admin_doctor">
                New Practice {requestCounts?.byType?.['new_practice_with_admin_doctor'] && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({requestCounts.byType['new_practice_with_admin_doctor']})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="doctor_join_practice">
                Doctor Join {requestCounts?.byType?.['doctor_join_practice'] && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({requestCounts.byType['doctor_join_practice']})
                  </span>
                )}
              </SelectItem>
              <SelectItem value="practice_edit_request">Practice Edit</SelectItem>
              <SelectItem value="practice_admin_practice_profile_edit">Practice Profile Edit</SelectItem>
              <SelectItem value="practice_admin_practice_locations_edit">Practice Locations Edit</SelectItem>
              <SelectItem value="practice_doctor_add_request">Add Doctor</SelectItem>
              <SelectItem value="practice_doctor_remove_request">Remove Doctor</SelectItem>
              <SelectItem value="practice_location_add_request">Location Add</SelectItem>
              <SelectItem value="practice_location_edit_request">Location Edit</SelectItem>
              <SelectItem value="practice_location_remove_request">Location Remove</SelectItem>
              <SelectItem value="practice_location_change_request">Location Change (Legacy)</SelectItem>
              <SelectItem value="practice_insurance_services_change_request">Insurance/Services</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      {/* Filter Results Summary */}
      {requestCounts && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              Showing <strong className="text-foreground">{requestCounts.filtered}</strong> of{' '}
              <strong className="text-foreground">{requestCounts.total}</strong> requests
            </span>
          </div>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Filters Active
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
