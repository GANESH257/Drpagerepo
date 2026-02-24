'use client';

import { useEffect, useState } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/dateUtils';
import { Eye } from 'lucide-react';

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
        title="Practice Approval Requests"
        description="Review and approve requests for your practice"
      />

      {requests.length === 0 ? (
        <EmptyState
          title="No approval requests"
          description="There are no approval requests for your practice yet."
        />
      ) : (
        <Card>
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
                {requests.map((request) => {
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
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/doctor/dashboard/practice/approvals/detail?id=${encodeURIComponent(request.id)}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
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
