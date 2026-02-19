'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { getPendingApprovalsForPracticeAdmin } from '@/lib/services/approvalEngine';
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

export default function PracticeAdminApprovalsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);
      
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Practice admin must have practiceId');
      }
      
      const pending = getPendingApprovalsForPracticeAdmin(actor.practiceId);
      setRequests(pending);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/doctor/dashboard');
      }
      setIsLoading(false);
    }
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
          title="No pending approvals"
          description="There are no approval requests requiring your decision at this time."
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <ApprovalTypeBadge type={request.type} />
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/doctor/dashboard/practice/approvals/${request.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
