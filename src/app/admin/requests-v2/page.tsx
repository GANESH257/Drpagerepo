'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { getApprovalRequests as getApprovalRequestsAPI } from '@/lib/api/approval-requests';
import { transformApprovalRequestsFromAPI } from '@/lib/api/approval-requests-transform';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { SearchAndFilterBar, FilterState } from '@/components/shared/approvals/SearchAndFilterBar';
import { ApprovalStatusBadge } from '@/components/shared/approvals/ApprovalStatusBadge';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/dateUtils';
import { Eye } from 'lucide-react';
import { getAllPractices } from '@/lib/services/practiceDirectoryService';
import { PracticeLocationAddPayload, PracticeLocationEditPayload, PracticeLocationRemovePayload, PracticeEditPayload } from '@/types/approvals';
import { PracticeLocation } from '@/types/practice';
import { diffPracticeChangedOnly } from '@/lib/utils/practiceDiff';
import { getAllDoctors } from '@/lib/memberStorage';

export default function AdminRequestsV2Page() {
  const router = useRouter();
  const pathname = usePathname();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});
  const [practices, setPractices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Refetch when we land on this page (including when navigating back from detail) so list and status stay in sync
  useEffect(() => {
    async function loadData() {
      try {
        const actor = getActorFromSession();
        assertAdmin(actor);

        // Load all data from API (no cache so we see latest approval state)
        const [apiRequests, allPractices, allDoctors] = await Promise.all([
          getApprovalRequestsAPI(),
          getAllPractices(),
          getAllDoctors(),
        ]);

        const transformedRequests = transformApprovalRequestsFromAPI(apiRequests);
        setRequests(transformedRequests);
        setFilteredRequests(transformedRequests);
        setPractices(allPractices);
        setDoctors(allDoctors);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AuthRequiredError) {
          router.push('/admin/login');
        } else if (error instanceof PermissionDeniedError) {
          router.push('/admin');
        } else {
          console.error('Error loading approval requests:', error);
        }
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, pathname]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);

    let filtered = [...requests];

    if (newFilters.status) {
      filtered = filtered.filter(r => r.status === newFilters.status);
    }

    if (newFilters.type) {
      filtered = filtered.filter(r => r.type === newFilters.type);
    }

    if (newFilters.searchQuery) {
      const query = newFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        // Search in practice name
        try {
          if (r.target?.practiceId) {
            const practice = practices.find(p => p.id === r.target.practiceId);
            if (practice?.name.toLowerCase().includes(query)) return true;
          }
        } catch (e) { /* ignore */ }

        // Search in doctor name
        try {
          if (r.target?.doctorId) {
            const doctor = doctors.find(d => d.id === r.target.doctorId);
            if (doctor?.fullName.toLowerCase().includes(query)) return true;
          }
        } catch (e) { /* ignore */ }

        // Search in submitted by email
        if (r.submittedBy.email?.toLowerCase().includes(query)) return true;

        // Search in location info
        try {
          const locationInfo = getLocationDisplay(r, practices);
          if (locationInfo) {
            if (locationInfo.name.toLowerCase().includes(query)) return true;
            if (locationInfo.address.toLowerCase().includes(query)) return true;
            if (locationInfo.locationId?.toLowerCase().includes(query)) return true;
          }
        } catch (e) { /* ignore */ }

        return false;
      });
    }

    setFilteredRequests(filtered);
  };

  const getLocationDisplay = (request: ApprovalRequest, practicesList: any[] = practices): { name: string; address: string; locationId?: string } | null => {
    const locationTypes = ['practice_location_add_request', 'practice_location_edit_request', 'practice_location_remove_request'];
    if (!locationTypes.includes(request.type)) return null;

    try {
      if (request.type === 'practice_location_add_request') {
        const payload = request.payload as PracticeLocationAddPayload;
        const location = payload.location;
        return {
          name: location.name || 'New Location',
          address: `${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim(),
          locationId: location.id,
        };
      } else if (request.type === 'practice_location_edit_request') {
        const payload = request.payload as PracticeLocationEditPayload;
        const location = payload.updatedLocation;
        return {
          name: location.name || 'Location',
          address: `${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim(),
          locationId: payload.locationId,
        };
      } else if (request.type === 'practice_location_remove_request') {
        const payload = request.payload as PracticeLocationRemovePayload;
        const practice = practices.find(p => p.id === payload.practiceId);
        if (practice) {
          const location = practice.locations?.find((l: PracticeLocation) => l.id === payload.locationId);
          if (location) {
            return {
              name: location.name || 'Location',
              address: `${location.city || ''}, ${location.state || ''} ${location.zip || ''}`.trim(),
              locationId: payload.locationId,
            };
          }
        }
        return {
          name: 'Location (not found)',
          address: '',
          locationId: payload.locationId,
        };
      }
    } catch {
      return null;
    }
    return null;
  };

  const getTargetDisplay = (request: ApprovalRequest): string => {
    try {
      if (request.target?.practiceId) {
        const practice = practices.find(p => p.id === request.target.practiceId);
        return practice?.name || request.target.practiceId;
      }
      if (request.target?.doctorId) {
        const doctor = doctors.find(d => d.id === request.target.doctorId);
        return doctor?.fullName || request.target.doctorId;
      }
    } catch {
      return 'Unknown';
    }
    return 'N/A';
  };

  const getQuickGlanceText = (request: ApprovalRequest): string | null => {
    try {
      switch (request.type) {
        case 'practice_location_add_request':
          return '+1 location';
        case 'practice_location_edit_request':
          return 'Update location';
        case 'practice_location_remove_request':
          return '-1 location';
        case 'practice_edit_request': {
          const payload = request.payload as PracticeEditPayload;
          if (payload.before && payload.after) {
            const changed = diffPracticeChangedOnly(payload.before, payload.after);
            return `${changed.length} field${changed.length !== 1 ? 's' : ''} changed`;
          }
          return 'Practice update';
        }
        case 'doctor_join_practice':
        case 'practice_doctor_add_request':
          return 'Add doctor';
        case 'practice_doctor_remove_request':
          return 'Remove doctor';
        case 'new_practice_with_admin_doctor':
          return 'New Account Application';
        default:
          return 'View details';
      }
    } catch {
      return 'View details';
    }
  };

  const getStats = () => {
    const pending = requests.filter(r => r.approvals.admin.status === 'pending').length;
    const underReview = requests.filter(r => r.status === 'under_review').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    return { pending, underReview, approved, rejected, total: requests.length };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Approval Requests (V2)"
        description="Review and manage all approval requests"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <SearchAndFilterBar
        onSearch={(query) => handleFilterChange({ ...filters, searchQuery: query })}
        onFilterChange={handleFilterChange}
        requestCounts={{
          total: requests.length,
          filtered: filteredRequests.length,
          byType: requests.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        }}
      />

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No approval requests found"
          description="There are no approval requests matching your filters."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Required Approvals</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const locationInfo = getLocationDisplay(request, practices);
                  const quickGlance = getQuickGlanceText(request);

                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <ApprovalTypeBadge type={request.type} />
                          {quickGlance && (
                            <span className="text-xs text-muted-foreground">{quickGlance}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ApprovalStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        {formatDateTime(request.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.submittedBy.role}</div>
                          {request.submittedBy.email && (
                            <div className="text-gray-500 text-xs">{request.submittedBy.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{getTargetDisplay(request)}</div>
                          {locationInfo && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              <div>{locationInfo.name}</div>
                              {locationInfo.address && <div>{locationInfo.address}</div>}
                              {locationInfo.locationId && (
                                <div className="font-mono text-xs mt-0.5">{locationInfo.locationId}</div>
                              )}
                            </div>
                          )}
                          {request.type === 'practice_edit_request' && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Practice update
                            </div>
                          )}
                          {request.type === 'new_practice_with_admin_doctor' && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Sign-up application
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Admin: <ApprovalStatusBadge status={request.approvals.admin.status as any} /></div>
                          {request.approvals.practiceAdmin && (
                            <div className="mt-1">Practice Admin: <ApprovalStatusBadge status={request.approvals.practiceAdmin.status as any} /></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/requests-v2/detail?id=${request.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
