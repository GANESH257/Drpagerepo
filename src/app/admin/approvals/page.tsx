'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { getApprovalRequests as getApprovalRequestsAPI } from '@/lib/api/approval-requests';
import { transformApprovalRequestsFromAPI } from '@/lib/api/approval-requests-transform';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateTime } from '@/lib/dateUtils';
import { Eye, Search, X } from 'lucide-react';
import { getPractices } from '@/lib/api/practices';
import { getDoctors } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';

const PRACTICE_TYPES = [
  'new_practice_with_admin_doctor',
  'doctor_join_practice',
  'practice_admin_practice_profile_edit',
  'practice_admin_practice_locations_edit',
];
const DOCTOR_TYPES = [
  'doctor_profile_completion',
  'practice_admin_profile_practice_completion',
  'practice_admin_profile_edit',
  'doctor_profile_edit',
  'doctor_insurance_edit',
  'practice_admin_insurance_edit',
];

const TYPE_LABELS: Record<string, string> = {
  new_practice_with_admin_doctor: 'New Practice',
  doctor_join_practice: 'Join Practice',
  practice_admin_practice_profile_edit: 'Practice Edit',
  practice_admin_practice_locations_edit: 'Location Edit',
  doctor_profile_completion: 'Profile Completion',
  practice_admin_profile_practice_completion: 'Profile Completion',
  practice_admin_profile_edit: 'Profile Edit',
  doctor_profile_edit: 'Profile Edit',
  doctor_insurance_edit: 'Insurance Edit',
  practice_admin_insurance_edit: 'Insurance Edit',
};

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [practices, setPractices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Filter state (shared across both tabs)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const actor = getActorFromSession();
        assertAdmin(actor);
        const token = getToken();
        if (!token) { router.push('/admin/login'); return; }
        const [apiRequests, practicesRes, doctorsRes] = await Promise.all([
          getApprovalRequestsAPI(),
          getPractices({ includePending: true, limit: 500 }, token),
          getDoctors({ limit: 500 }, token),
        ]);
        setRequests(transformApprovalRequestsFromAPI(apiRequests));
        setPractices(practicesRes.practices || []);
        setDoctors(doctorsRes.doctors || []);
      } catch (error) {
        if (error instanceof AuthRequiredError) router.push('/admin/login');
        else if (error instanceof PermissionDeniedError) router.push('/admin');
        else console.error('Error loading approvals:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const getApplicantName = (request: ApprovalRequest): string => {
    try {
      const doctor = request.payload?.doctor;
      if (doctor?.fullName) return doctor.fullName;
      if (doctor?.email) return doctor.email;
      if (request.submittedBy?.email && !request.submittedBy.email.startsWith('user-'))
        return request.submittedBy.email;
      const d = doctors.find((x: any) => x.id === request.target?.doctorId);
      return d?.fullName || '—';
    } catch { return '—'; }
  };

  const getPracticeDisplay = (request: ApprovalRequest): string => {
    try {
      if (request.type === 'new_practice_with_admin_doctor')
        return request.payload?.practice?.name || 'New Practice';
      if (request.target?.practiceId) {
        const p = practices.find((x: any) => x.id === request.target?.practiceId);
        return p?.name || request.target.practiceId;
      }
    } catch { return '—'; }
    return '—';
  };

  const getApplicantEmail = (request: ApprovalRequest): string => {
    try {
      const doctor = request.payload?.doctor;
      if (doctor?.email) return doctor.email;
      if (request.submittedBy?.email && !request.submittedBy.email.startsWith('user-'))
        return request.submittedBy.email;
    } catch { return '—'; }
    return '—';
  };

  const practiceRequests = requests.filter((r) => PRACTICE_TYPES.includes(r.type));
  const doctorRequests = requests.filter((r) => DOCTOR_TYPES.includes(r.type));

  // Unique type labels for each tab
  const practiceTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    practiceRequests.forEach((r) => seen.add(r.type));
    return Array.from(seen);
  }, [practiceRequests]);

  const doctorTypeOptions = useMemo(() => {
    const seen = new Set<string>();
    doctorRequests.forEach((r) => seen.add(r.type));
    return Array.from(seen);
  }, [doctorRequests]);

  const applyFilters = (list: ApprovalRequest[]): ApprovalRequest[] => {
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      if (statusFilter !== 'all' && r.status?.toLowerCase() !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (q) {
        const name = getApplicantName(r).toLowerCase();
        const email = getApplicantEmail(r).toLowerCase();
        const practice = getPracticeDisplay(r).toLowerCase();
        const type = (TYPE_LABELS[r.type] || r.type).toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !practice.includes(q) && !type.includes(q))
          return false;
      }
      return true;
    });
  };

  const filteredPractice = applyFilters(practiceRequests);
  const filteredDoctor = applyFilters(doctorRequests);

  const hasActiveFilters = search || statusFilter !== 'all' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const FilterBar = ({ typeOptions }: { typeOptions: string[] }) => (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 mb-4">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, practice…"
          className="pl-9 h-9 bg-background text-sm"
        />
      </div>
      {/* Status */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-9 w-[140px] bg-background text-sm">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="denied">Denied</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
        </SelectContent>
      </Select>
      {/* Type */}
      {typeOptions.length > 0 && (
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[160px] bg-background text-sm">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>{TYPE_LABELS[t] || t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );

  const renderTable = (list: ApprovalRequest[]) => (
    <>
      {list.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching requests' : 'No requests in this queue'}
          description={hasActiveFilters ? 'Try adjusting your filters.' : 'There are no approval requests in this category.'}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="uppercase tracking-wider text-muted-foreground">Type</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Submitted</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Applicant</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Practice / Institution</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Email</TableHead>
                <TableHead className="uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((request) => (
                <TableRow key={request.id} className="hover:bg-accent/30">
                  <TableCell><ApprovalTypeBadge type={request.type} /></TableCell>
                  <TableCell><StatusBadge status={request.status} /></TableCell>
                  <TableCell>{formatDateTime(request.submittedAt)}</TableCell>
                  <TableCell className="font-medium">{getApplicantName(request)}</TableCell>
                  <TableCell>{getPracticeDisplay(request)}</TableCell>
                  <TableCell className="text-muted-foreground">{getApplicantEmail(request)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10"
                      onClick={() => router.push(`/admin/approvals/detail?id=${request.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--aip-teal)' }} />
          <p className="text-muted-foreground">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Membership Approvals"
        description="Review and approve or deny new practice applications and doctor profile submissions."
      />
      <Tabs defaultValue="practice" className="w-full">
        <TabsList className="inline-flex h-9 rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger
            value="practice"
            className="rounded-md px-4 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-br data-[state=active]:from-[var(--aip-teal)] data-[state=active]:to-[var(--aip-navy)]"
          >
            Practice Approvals ({filteredPractice.length}/{practiceRequests.length})
          </TabsTrigger>
          <TabsTrigger
            value="doctor"
            className="rounded-md px-4 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-br data-[state=active]:from-[var(--aip-teal)] data-[state=active]:to-[var(--aip-navy)]"
          >
            Doctor Approvals ({filteredDoctor.length}/{doctorRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            New practice registrations, doctors joining a practice, and practice profile/location edits submitted by practice admins.
          </p>
          <FilterBar typeOptions={practiceTypeOptions} />
          {renderTable(filteredPractice)}
        </TabsContent>

        <TabsContent value="doctor" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Doctor profiles submitted for publication after onboarding.
          </p>
          <FilterBar typeOptions={doctorTypeOptions} />
          {renderTable(filteredDoctor)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
