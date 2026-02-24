'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Referral, ReferralStatus } from '@/types/referrals';
import { ReferralHistoryRecord } from '@/types/referrals';
import { getReferralsForDoctor, getReferralTimeline } from '@/lib/services/referralEngine';
import { getHistoryForDoctor } from '@/lib/storage/referralHistoryStorage';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { DateRangePicker, DateRange } from '@/components/shared/history/DateRangePicker';
import { formatDateTime, formatDate } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { getAllDoctors } from '@/lib/memberStorage';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';
import { ExternalLink, Copy } from 'lucide-react';

interface ReferralHistoryFilters {
  status: ReferralStatus | 'all';
  dateRange: DateRange;
  practiceId: string | 'all';
}

export default function DoctorHistoryPage() {
  const router = useRouter();
  const [referralsSent, setReferralsSent] = useState<Referral[]>([]);
  const [referralsReceived, setReferralsReceived] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [timeline, setTimeline] = useState<ReferralHistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [allDoctors, setAllDoctors] = useState<any[]>([]);

  // Default filters: last 30 days
  const defaultDateRange: DateRange = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: thirtyDaysAgo, to: now };
  }, []);

  const [filters, setFilters] = useState<ReferralHistoryFilters>({
    status: 'all',
    dateRange: defaultDateRange,
    practiceId: 'all',
  });

  // Get current doctor's practice for practice filter
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  
  useEffect(() => {
    async function loadCurrentDoctor() {
      try {
        const actor = getActorFromSession();
        if (actor.kind === 'doctor' && actor.doctorId) {
          const allDoctors = await getAllDoctors();
          const doctor = allDoctors.find((d) => d.id === actor.doctorId);
          setCurrentDoctor(doctor || null);
        }
      } catch {
        setCurrentDoctor(null);
      }
    }
    loadCurrentDoctor();
  }, []);

  const [practices, setPractices] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadPractices() {
      const practiceSet = new Set<string>();
      [...referralsSent, ...referralsReceived].forEach((ref) => {
        if (ref.fromPracticeId) practiceSet.add(ref.fromPracticeId);
        if (ref.toPracticeId) practiceSet.add(ref.toPracticeId);
      });
      const practicePromises = Array.from(practiceSet).map((id) => getPracticeById(id));
      const practiceResults = await Promise.all(practicePromises);
      setPractices(practiceResults.filter((p) => p !== null) as any[]);
    }
    loadPractices();
  }, [referralsSent, referralsReceived]);

  useEffect(() => {
    async function loadData() {
      try {
        const actor = getActorFromSession();
        assertDoctor(actor);

        if (actor.kind !== 'doctor' || !actor.doctorId) {
          throw new PermissionDeniedError('Must be a doctor');
        }

        // Load doctors first
        const doctors = await getAllDoctors();
        setAllDoctors(doctors);

        const { referralsSent, referralsReceived } = getReferralsForDoctor(actor, actor.doctorId);
        setReferralsSent(referralsSent);
        setReferralsReceived(referralsReceived);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AuthRequiredError) {
          router.push('/join-us');
        } else if (error instanceof PermissionDeniedError) {
          router.push('/doctor/dashboard');
        }
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Filter referrals based on active tab and filters
  const filteredReferrals = useMemo(() => {
    const referrals = activeTab === 'sent' ? referralsSent : referralsReceived;
    let filtered = [...referrals];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter((r) => {
        const referralDate = new Date(r.createdAt).getTime();
        if (filters.dateRange.from && referralDate < filters.dateRange.from.getTime()) {
          return false;
        }
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (referralDate > toDate.getTime()) {
            return false;
          }
        }
        return true;
      });
    }

    // Practice filter
    if (filters.practiceId !== 'all') {
      filtered = filtered.filter((r) => {
        if (activeTab === 'sent') {
          return r.fromPracticeId === filters.practiceId;
        } else {
          return r.toPracticeId === filters.practiceId;
        }
      });
    }

    // Sort by createdAt descending (newest first)
    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [referralsSent, referralsReceived, activeTab, filters]);

  const handleRowClick = (referral: Referral) => {
    setSelectedReferral(referral);
    try {
      const actor = getActorFromSession();
      if (actor.kind === 'doctor') {
        const history = getReferralTimeline(actor, referral.id, referral);
        setTimeline(history);
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
    setShowDrawer(true);
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const variants: Record<ReferralStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      considering: 'outline',
      accepted: 'default',
      no_show: 'secondary',
      cancelled: 'destructive',
    };
    return variants[status];
  };

  const getDoctorName = (doctorId: string): string => {
    const doctor = allDoctors.find((d) => d.id === doctorId);
    return doctor?.fullName || doctorId;
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

  const handleOpenInReferrals = () => {
    if (selectedReferral) {
      const isReceived = referralsReceived.some((r) => r.id === selectedReferral.id);
      const tab = isReceived ? 'received' : 'sent';
      router.push(`/doctor/dashboard/referrals?tab=${tab}&referralId=${selectedReferral.id}`);
      setShowDrawer(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Referral History"
        description="View and filter your referral history"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sent' | 'received')}>
        <TabsList>
          <TabsTrigger value="received">
            Received ({referralsReceived.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({referralsSent.length})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value as ReferralStatus | 'all' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="considering">Considering</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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

                {/* Practice Filter (optional) */}
                {practices.length > 0 && (
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
                        {practices.map((practice: any) => (
                          <SelectItem key={practice.id} value={practice.id}>
                            {practice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 mt-2">
          Showing {filteredReferrals.length} of{' '}
          {activeTab === 'sent' ? referralsSent.length : referralsReceived.length} referrals
        </div>

        {/* Referrals List */}
        <TabsContent value={activeTab} className="space-y-4">
          {filteredReferrals.length === 0 ? (
            <EmptyState
              title={`No ${activeTab} referrals found`}
              description="There are no referrals matching your filters."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>{activeTab === 'sent' ? 'To Doctor' : 'From Doctor'}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Condition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReferrals.map((referral) => (
                      <TableRow
                        key={referral.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(referral)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formatRelativeTime(referral.createdAt)}
                            </span>
                            <span className="text-xs text-gray-500" title={formatDateTime(referral.createdAt)}>
                              {formatDateTime(referral.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {activeTab === 'sent'
                              ? getDoctorName(referral.toDoctorId)
                              : getDoctorName(referral.fromDoctorId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(referral.status)}>
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {referral.condition.length > 80
                              ? `${referral.condition.substring(0, 80)}...`
                              : referral.condition}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Drawer */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedReferral && (
            <>
              <SheetHeader>
                <SheetTitle>Referral Details</SheetTitle>
                <SheetDescription>
                  {formatDateTime(selectedReferral.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Referral Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={getStatusBadge(selectedReferral.status)}>
                        {selectedReferral.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {activeTab === 'sent' ? 'To Doctor:' : 'From Doctor:'}
                      </span>
                      <span className="font-medium">
                        {activeTab === 'sent'
                          ? getDoctorName(selectedReferral.toDoctorId)
                          : getDoctorName(selectedReferral.fromDoctorId)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-medium">{selectedReferral.condition}</span>
                    </div>
                    {selectedReferral.patient.name && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Patient:</span>
                        <span className="font-medium">
                          {selectedReferral.patient.name}
                          {selectedReferral.patient.dob && `, DOB ${selectedReferral.patient.dob}`}
                          {selectedReferral.patient.sex && `, ${selectedReferral.patient.sex}`}
                        </span>
                      </div>
                    )}
                    {selectedReferral.notes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <p className="mt-1 text-sm">{selectedReferral.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Timeline Section */}
                <div>
                  <h3 className="font-semibold mb-2">Timeline</h3>
                  <Timeline records={timeline} />
                </div>

                <Separator />

                {/* Actions */}
                <div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleOpenInReferrals}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Referrals
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
