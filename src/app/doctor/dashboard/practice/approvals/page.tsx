'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { getApprovalsForPracticeAdmin } from '@/lib/services/approvalEngine';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { ApprovalStatusBadge } from '@/components/shared/approvals/ApprovalStatusBadge';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/dateUtils';
import { getApprovalTypeLabel } from '@/lib/utils/approvalTypeLabels';
import { Eye, ArrowRight, Search, X } from 'lucide-react';

/** Applicant display name: prefer payload.doctor.fullName, else email, else role + id */
function getApplicantDisplay(request: ApprovalRequest): { name: string; email: string } {
  const payload = request.payload || {};
  const doctor = payload.doctor || {};
  const name =
    (doctor.fullName && String(doctor.fullName).trim()) ||
    (doctor.email && String(doctor.email)) ||
    request.submittedBy.email ||
    (request.submittedBy.role === 'doctor' && request.submittedBy.doctorId
      ? `Doctor (${request.submittedBy.doctorId})`
      : request.submittedBy.role === 'public'
        ? 'Applicant'
        : request.submittedBy.role);
  const email =
    doctor.email ||
    request.submittedBy.email ||
    request.target?.invitedDoctorEmail ||
    '';
  return { name: name || '—', email: email || '—' };
}

/** Practice name from payload if present */
function getPracticeDisplay(request: ApprovalRequest): string {
  const payload = request.payload || {};
  const practice = payload.practice || {};
  const name = practice.name && String(practice.name).trim();
  return name || (request.target?.practiceId ? `Practice` : '—');
}

export default function PracticeAdminApprovalsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadRequests() {
      try {
        const actor = getActorFromSession();
        assertPracticeAdmin(actor);
        
        if (actor.kind !== 'doctor' || !actor.practiceId) {
          throw new PermissionDeniedError('Practice admin must have practiceId');
        }
        
        const list = await getApprovalsForPracticeAdmin(actor.practiceId);
        setRequests(list);
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
    loadRequests();
  }, [router]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(requests.map((r) => r.type))).sort();
    return [
      { value: 'all', label: 'All Types' },
      ...types.map((t) => ({ value: t, label: getApprovalTypeLabel(t as any) })),
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (typeFilter !== 'all' && request.type !== typeFilter) return false;
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const applicant = getApplicantDisplay(request);
        const nameMatch = applicant.name.toLowerCase().includes(q);
        const emailMatch = applicant.email.toLowerCase().includes(q);
        const practiceName = getPracticeDisplay(request).toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !practiceName) return false;
      }
      return true;
    });
  }, [requests, typeFilter, statusFilter, search]);

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || search.trim() !== '';

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aip-teal)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Practice Approval Requests"
        description="Review and approve requests for your practice"
        variant="practice"
      />

      {requests.length === 0 ? (
        <EmptyState
          title="No approval requests"
          description="There are no approval requests for your practice yet."
          className="card-practice-accent"
        />
      ) : (
        <Card className="card-practice-accent">
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search applicant, email, practice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-background"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px] h-9 bg-background text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-background text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {filteredRequests.length} of {requests.length}
              </span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1.5 text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Practice</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      {hasActiveFilters
                        ? 'No requests match your filters. Try clearing filters.'
                        : 'No approval requests.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => {
                  const applicant = getApplicantDisplay(request);
                  const practiceName = getPracticeDisplay(request);
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <ApprovalTypeBadge type={request.type} />
                      </TableCell>
                      <TableCell>
                        <ApprovalStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{applicant.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">{applicant.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{practiceName}</span>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(request.submittedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="portal-primary"
                          size="sm"
                          onClick={() =>
                            router.push(`/doctor/dashboard/practice/approvals/detail?id=${encodeURIComponent(request.id)}`)
                          }
                        >
                          Review
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
