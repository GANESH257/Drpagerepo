'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { getApprovalRequests as getApprovalRequestsAPI } from '@/lib/api/approval-requests';
import { transformApprovalRequestsFromAPI } from '@/lib/api/approval-requests-transform';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { ApprovalStatusBadge } from '@/components/shared/approvals/ApprovalStatusBadge';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime } from '@/lib/dateUtils';
import { Eye } from 'lucide-react';
import { getPractices } from '@/lib/api/practices';
import { getDoctors } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';

const PRACTICE_TYPES = ['new_practice_with_admin_doctor', 'doctor_join_practice'];
const DOCTOR_TYPES = ['doctor_profile_completion', 'practice_admin_profile_practice_completion'];

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [practices, setPractices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const actor = getActorFromSession();
        assertAdmin(actor);
        const token = getToken();
        if (!token) {
          router.push('/admin/login');
          return;
        }
        const [apiRequests, practicesRes, doctorsRes] = await Promise.all([
          getApprovalRequestsAPI(),
          getPractices({ includePending: true, limit: 500 }, token),
          getDoctors({ limit: 500 }, token),
        ]);
        const transformed = transformApprovalRequestsFromAPI(apiRequests);
        setRequests(transformed);
        setPractices(practicesRes.practices || []);
        setDoctors(doctorsRes.doctors || []);
      } catch (error) {
        if (error instanceof AuthRequiredError) {
          router.push('/admin/login');
        } else if (error instanceof PermissionDeniedError) {
          router.push('/admin');
        } else {
          console.error('Error loading approvals:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const practiceRequests = requests.filter((r) => PRACTICE_TYPES.includes(r.type));
  const doctorRequests = requests.filter((r) => DOCTOR_TYPES.includes(r.type));

  const getTargetDisplay = (request: ApprovalRequest): string => {
    try {
      if (request.target?.practiceId) {
        const p = practices.find((x: any) => x.id === request.target?.practiceId);
        return p?.name || request.target.practiceId;
      }
      if (request.target?.doctorId) {
        const d = doctors.find((x: any) => x.id === request.target?.doctorId);
        return d?.fullName || request.target.doctorId;
      }
      if (request.submittedBy?.email) return request.submittedBy.email;
    } catch {
      return '—';
    }
    return '—';
  };

  const renderTable = (list: ApprovalRequest[]) => (
    <>
      {list.length === 0 ? (
        <EmptyState
          title="No requests in this queue"
          description="There are no approval requests in this category."
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
                  <TableHead>Applicant / Target</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <ApprovalTypeBadge type={request.type} />
                    </TableCell>
                    <TableCell>
                      <ApprovalStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(request.submittedAt)}</TableCell>
                    <TableCell>{getTargetDisplay(request)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/approvals/${request.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4" />
          <p className="text-gray-600">Loading approval requests...</p>
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
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="practice">
            Practice Approvals ({practiceRequests.length})
          </TabsTrigger>
          <TabsTrigger value="doctor">
            Doctor Approvals ({doctorRequests.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="practice" className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            New practice registrations and doctors joining an existing practice.
          </p>
          {renderTable(practiceRequests)}
        </TabsContent>
        <TabsContent value="doctor" className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Doctor profiles submitted for publication after onboarding.
          </p>
          {renderTable(doctorRequests)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
