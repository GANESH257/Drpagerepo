'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalHistoryRecord, ApprovalRequest, ApprovalType } from '@/types/approvals';
import { getApprovalHistory } from '@/lib/storage/approvalStorage';
import { getApprovalRequests } from '@/lib/storage/approvalStorage';
import { getApprovalTimeline } from '@/lib/services/approvalEngine';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { DateRangePicker, DateRange } from '@/components/shared/history/DateRangePicker';
import { formatDateTime, formatDate } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { getApprovalTypeOptions, getApprovalTypeLabel } from '@/lib/utils/approvalTypeLabels';
import { normalizeApprovalHistoryRecords, NormalizedApprovalHistoryRecord } from '@/lib/utils/approvalHistoryHelpers';
import { getStatusLabel, getStatusBadgeVariant } from '@/lib/utils/approvalStatusHelpers';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { Copy, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PracticeHistoryFilters {
  status: 'pending' | 'approved' | 'rejected' | 'all';
  dateRange: DateRange;
  type: ApprovalType | 'all';
  doctorId: string | 'all';
}

/**
 * Get allowed approval types for practice admin
 */
function getAllowedPracticeAdminTypes(): ApprovalType[] {
  return [
    'practice_edit_request',
    'practice_admin_practice_profile_edit',
    'practice_admin_practice_locations_edit',
    'practice_doctor_add_request',
    'practice_doctor_remove_request',
    'doctor_join_practice',
    'new_practice_with_admin_doctor',
  ];
}

/**
 * Filter approval history records by practice ID
 * Checks multiple sources: record.practiceId, request.target.practiceId, request.payload.practiceId
 */
function filterByPracticeId(
  records: ApprovalHistoryRecord[],
  requests: ApprovalRequest[],
  practiceId: string
): ApprovalHistoryRecord[] {
  const requestMap = new Map(requests.map((r) => [r.id, r]));
  return records.filter((record) => {
    // Check record.practiceId
    if (record.practiceId === practiceId) return true;

    // Check request.target.practiceId
    const request = requestMap.get(record.requestId);
    if (request?.target.practiceId === practiceId) return true;

    // Check request.payload.practiceId (for practice_create)
    if (request?.payload?.practiceId === practiceId) return true;

    return false;
  });
}

export default function PracticeAdminHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ApprovalHistoryRecord[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<NormalizedApprovalHistoryRecord | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [timeline, setTimeline] = useState<ApprovalHistoryRecord[]>([]);
  const [practiceId, setPracticeId] = useState<string | null>(null);

  // Default filters: last 30 days
  const defaultDateRange: DateRange = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: thirtyDaysAgo, to: now };
  }, []);

  const [filters, setFilters] = useState<PracticeHistoryFilters>({
    status: 'all',
    dateRange: defaultDateRange,
    type: 'all',
    doctorId: 'all',
  });

  // Get allowed types for practice admin
  const allowedTypes = useMemo(() => getAllowedPracticeAdminTypes(), []);

  // Get type options filtered to allowed types only
  const typeOptions = useMemo(() => {
    const allOptions = getApprovalTypeOptions();
    return [
      { value: 'all' as const, label: 'All Types' },
      ...allOptions.filter((opt) =>
        opt.value !== 'all' && allowedTypes.includes(opt.value as ApprovalType)
      ),
    ];
  }, [allowedTypes]);

  // Get all doctors for selector
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const token = getToken();
        const allDoctors = await getAllDoctorsArray(token ?? undefined);
        setDoctors(allDoctors);
      } catch (error) {
        console.error('Error loading doctors:', error);
        setDoctors([]);
      }
    }
    loadDoctors();
  }, []);

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);

      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Practice admin must have a practice ID');
      }

      setPracticeId(actor.practiceId);

      const allHistory = getApprovalHistory();
      const allRequests = getApprovalRequests();

      // Filter by practice ID first
      const practiceHistory = filterByPracticeId(allHistory, allRequests, actor.practiceId);

      // Filter by allowed types
      const filteredByType = practiceHistory.filter((record) =>
        allowedTypes.includes(record.type)
      );

      setHistory(filteredByType);
      setRequests(allRequests);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/doctor/dashboard');
      }
      setIsLoading(false);
    }
  }, [router, allowedTypes]);

  // Normalize history records
  const [normalizedHistory, setNormalizedHistory] = useState<NormalizedApprovalHistoryRecord[]>([]);
  
  useEffect(() => {
    async function normalize() {
      const normalized = await normalizeApprovalHistoryRecords(history, requests);
      setNormalizedHistory(normalized);
    }
    normalize();
  }, [history, requests]);

  // Filter history records (apply filters in priority order)
  const filteredHistory = useMemo(() => {
    let filtered = [...normalizedHistory];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter((r) => {
        const recordDate = new Date(r.timestamp).getTime();
        if (filters.dateRange.from && recordDate < filters.dateRange.from.getTime()) {
          return false;
        }
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (recordDate > toDate.getTime()) {
            return false;
          }
        }
        return true;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    // Doctor filter
    if (filters.doctorId !== 'all') {
      filtered = filtered.filter((r) => r.doctorId === filters.doctorId);
    }

    // Sort by timestamp descending (newest first)
    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [normalizedHistory, filters]);

  const handleRowClick = async (record: NormalizedApprovalHistoryRecord) => {
    setSelectedRecord(record);
    // Load timeline for this request
    const requestTimeline = await getApprovalTimeline(record.requestId);
    setTimeline(requestTimeline);
    setShowDrawer(true);
  };

  const handleCopyRequestId = () => {
    if (selectedRecord) {
      navigator.clipboard.writeText(selectedRecord.requestId);
      toast.success('Request ID copied to clipboard');
    }
  };

  const handleCopyPayload = () => {
    if (selectedRecord?.payloadSnapshot) {
      navigator.clipboard.writeText(JSON.stringify(selectedRecord.payloadSnapshot, null, 2));
      toast.success('Payload JSON copied to clipboard');
    }
  };

  const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice history...</p>
        </div>
      </div>
    );
  }

  if (!practiceId) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Practice History"
          description="Approval history for your practice"
        />
        <Card>
          <CardContent className="py-12">
            <EmptyState
              title="Access Denied"
              description="You must be a practice admin with an associated practice to view practice history."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Practice History"
        description="Approval history for your practice"
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value as typeof filters.status })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => setFilters({ ...filters, dateRange: range })}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value as ApprovalType | 'all' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced-filters" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium">
                More filters
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-2">
                  {/* Doctor Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Doctor</label>
                    <Select
                      value={filters.doctorId}
                      onValueChange={(value) =>
                        setFilters({ ...filters, doctorId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Doctors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Doctors</SelectItem>
                        {doctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredHistory.length} of {normalizedHistory.length} history records
      </div>

      {/* Table */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No practice-related approvals found"
          description="There are no approval history records matching your filters."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Decided By</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(record)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {formatRelativeTime(record.timestamp)}
                        </span>
                        <span
                          className="text-xs text-gray-500"
                          title={formatDateTime(record.timestamp)}
                        >
                          {formatDateTime(record.timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ApprovalTypeBadge type={record.type} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(record.status)}>
                        {getStatusLabel(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.doctorName ? (
                        <span className="text-sm">{record.doctorName}</span>
                      ) : record.doctorId ? (
                        <code className="text-xs">{record.doctorId}</code>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {record.actor.actorName || record.actor.actorRole}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {record.actor.actorRole.replace('_', ' ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.reason ? (
                        <div className="flex items-center" title={record.reason}>
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Details Drawer */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedRecord && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <ApprovalTypeBadge type={selectedRecord.type} />
                  <Badge variant={getStatusBadgeVariant(selectedRecord.status)}>
                    {getStatusLabel(selectedRecord.status)}
                  </Badge>
                </div>
                <SheetTitle>Approval History Details</SheetTitle>
                <SheetDescription>
                  {formatDateTime(selectedRecord.timestamp)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Summary Section */}
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Request ID:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {selectedRecord.requestId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyRequestId}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {selectedRecord.practiceName && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Practice:</span>
                        <span className="font-medium">{selectedRecord.practiceName}</span>
                      </div>
                    )}
                    {selectedRecord.doctorName && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="font-medium">{selectedRecord.doctorName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Actor:</span>
                      <span className="font-medium">
                        {selectedRecord.actor.actorName || selectedRecord.actor.actorRole}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Decision Section */}
                <div>
                  <h3 className="font-semibold mb-2">Decision</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(selectedRecord.status)}>
                        {getStatusLabel(selectedRecord.status)}
                      </Badge>
                    </div>
                    {selectedRecord.reason && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-yellow-800 mb-1">Reason:</div>
                            <p className="text-yellow-700 text-sm">{selectedRecord.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Payload Snapshot Section */}
                {selectedRecord.payloadSnapshot && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Payload Snapshot</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPayload}
                        className="h-8"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy JSON
                      </Button>
                    </div>
                    <div className="bg-gray-50 border rounded p-3 overflow-x-auto">
                      <pre className="text-xs">
                        {JSON.stringify(selectedRecord.payloadSnapshot, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Timeline Section */}
                <div>
                  <h3 className="font-semibold mb-2">Timeline</h3>
                  <Timeline records={timeline} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
