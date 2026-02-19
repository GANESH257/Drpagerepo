'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalHistoryRecord, ApprovalRequest, ApprovalType, ApprovalStatus } from '@/types/approvals';
import { getApprovalHistory } from '@/lib/storage/approvalStorage';
import { getApprovalRequests } from '@/lib/storage/approvalStorage';
import { getApprovalTimeline } from '@/lib/services/approvalEngine';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
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
import { RequestedChangesRenderer } from '@/components/shared/approvals/RequestedChangesRenderer';
import { DateRangePicker, DateRange } from '@/components/shared/history/DateRangePicker';
import { formatDateTime, formatDate } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { getApprovalTypeOptions, getApprovalTypeLabel } from '@/lib/utils/approvalTypeLabels';
import { normalizeApprovalHistoryRecords, NormalizedApprovalHistoryRecord } from '@/lib/utils/approvalHistoryHelpers';
import { deriveStatusFromAction, getStatusLabel, getStatusBadgeVariant } from '@/lib/utils/approvalStatusHelpers';
import { getAllPractices } from '@/lib/services/practiceDirectoryService';
import { getAllDoctors } from '@/lib/memberStorage';
import { Copy, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HistoryFilters {
  type: ApprovalType | 'all';
  status: 'pending' | 'approved' | 'rejected' | 'all';
  dateRange: DateRange;
  practiceId: string | 'all';
  doctorId: string | 'all';
}

export default function AdminApprovalHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ApprovalHistoryRecord[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<NormalizedApprovalHistoryRecord | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [timeline, setTimeline] = useState<ApprovalHistoryRecord[]>([]);
  
  // Default filters: last 30 days
  const defaultDateRange: DateRange = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: thirtyDaysAgo, to: now };
  }, []);

  const [filters, setFilters] = useState<HistoryFilters>({
    type: 'all',
    status: 'all',
    dateRange: defaultDateRange,
    practiceId: 'all',
    doctorId: 'all',
  });

  // Get all practices and doctors for selectors
  const practices = useMemo(() => getAllPractices(), []);
  const doctors = useMemo(() => getAllDoctors(), []);

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertAdmin(actor);
      
      const allHistory = getApprovalHistory();
      const allRequests = getApprovalRequests();
      setHistory(allHistory);
      setRequests(allRequests);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/admin/login');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/admin');
      }
      setIsLoading(false);
    }
  }, [router]);

  // Normalize history records
  const normalizedHistory = useMemo(() => {
    return normalizeApprovalHistoryRecords(history, requests);
  }, [history, requests]);

  // Filter history records
  const filteredHistory = useMemo(() => {
    let filtered = [...normalizedHistory];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

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

    // Practice filter
    if (filters.practiceId !== 'all') {
      filtered = filtered.filter((r) => r.practiceId === filters.practiceId);
    }

    // Doctor filter
    if (filters.doctorId !== 'all') {
      filtered = filtered.filter((r) => r.doctorId === filters.doctorId);
    }

    // Sort by timestamp descending (newest first)
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [normalizedHistory, filters]);

  const handleRowClick = (record: NormalizedApprovalHistoryRecord) => {
    setSelectedRecord(record);
    // Load timeline for this request
    const requestTimeline = getApprovalTimeline(record.requestId);
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

  const getSelectedRequest = (): ApprovalRequest | undefined => {
    if (!selectedRecord) return undefined;
    return requests.find((r) => r.id === selectedRecord.requestId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Approvals History"
        description="Complete audit log of all approval actions with advanced filtering"
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {getApprovalTypeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          {/* Advanced Filters (Collapsible) */}
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced-filters" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium">
                More filters
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Practice Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Practice</label>
                    <Select
                      value={filters.practiceId}
                      onValueChange={(value) =>
                        setFilters({ ...filters, practiceId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Practices" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Practices</SelectItem>
                        {practices.map((practice) => (
                          <SelectItem key={practice.id} value={practice.id}>
                            {practice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
          title="No history records found"
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
                  <TableHead>Practice</TableHead>
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
                        <span className="text-xs text-gray-500" title={formatDateTime(record.timestamp)}>
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
                      {record.practiceName ? (
                        <span className="text-sm">{record.practiceName}</span>
                      ) : record.practiceId ? (
                        <code className="text-xs">{record.practiceId}</code>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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
                      <h3 className="font-semibold">Requested Changes</h3>
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
                    {(() => {
                      const locationTypes = ['practice_location_add_request', 'practice_location_edit_request', 'practice_location_remove_request'];
                      const isLocationRequest = selectedRecord.type && locationTypes.includes(selectedRecord.type);
                      
                      if (isLocationRequest && selectedRecord.payloadSnapshot) {
                        // Construct ApprovalRequest-like object from snapshot
                        // Resolve practiceId from multiple possible locations:
                        // 1. payloadSnapshot.practiceId (direct in payload)
                        // 2. selectedRecord.practiceId (from normalized record)
                        // 3. payloadSnapshot.target.practiceId (from snapshot.target if snapshot is full request)
                        // 4. snapshot.target.practiceId (from separate snapshot property if it exists)
                        const payloadSnapshot = selectedRecord.payloadSnapshot as any;
                        const snapshot = (selectedRecord as any).snapshot as any; // Optional: separate snapshot property
                        const resolvedPracticeId =
                          payloadSnapshot?.practiceId ??
                          selectedRecord.practiceId ??
                          payloadSnapshot?.target?.practiceId ??
                          snapshot?.target?.practiceId ??
                          null;
                        
                        const requestLike: ApprovalRequest = {
                          id: selectedRecord.requestId || '',
                          type: selectedRecord.type as ApprovalType,
                          status: selectedRecord.status as ApprovalStatus,
                          submittedAt: selectedRecord.timestamp || '',
                          updatedAt: selectedRecord.timestamp || '',
                          submittedBy: {
                            role: selectedRecord.actor.actorRole as 'public' | 'doctor' | 'practice_admin' | 'admin',
                            email: selectedRecord.actor.actorName?.includes('@') ? selectedRecord.actor.actorName : undefined,
                          },
                          approvals: {
                            admin: {
                              status: 'approved', // Default for history records
                            },
                          },
                          target: {
                            // Runtime guard: convert null to undefined for type safety
                            practiceId: resolvedPracticeId ?? undefined,
                            doctorId: selectedRecord.doctorId,
                          },
                          payload: {
                            ...(payloadSnapshot ?? {}),
                            // prefer payload.practiceId, fallback to record.practiceId, fallback to snapshot.target.practiceId (both payloadSnapshot and snapshot)
                            // Runtime guard: convert null to undefined for type safety (renderer handles missing practiceId with warnings)
                            practiceId: resolvedPracticeId ?? undefined,
                          },
                        };
                        return <RequestedChangesRenderer request={requestLike} />;
                      } else {
                        // Fallback to raw JSON
                        return (
                          <div className="bg-gray-50 border rounded p-3 overflow-x-auto">
                            <pre className="text-xs">
                              {JSON.stringify(selectedRecord.payloadSnapshot, null, 2)}
                            </pre>
                          </div>
                        );
                      }
                    })()}
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
