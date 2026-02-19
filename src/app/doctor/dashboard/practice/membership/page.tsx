'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { getPracticeDoctorsMembershipOverview } from '@/lib/services/membershipService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { Membership } from '@/types/membership';
import { doctors } from '@/data/doctors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/dateUtils';

export default function PracticeMembershipOverviewPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Array<{ doctorId: string; membership?: Membership }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);
      
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Practice admin must have practiceId');
      }
      
      const memberships = getPracticeDoctorsMembershipOverview(actor.practiceId);
      setOverview(memberships);
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
          <p className="text-gray-600">Loading membership overview...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      expired: 'destructive',
      canceled: 'outline',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Practice Membership Overview"
        description="View membership status for all doctors in your practice"
      />

      {overview.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No doctors in practice</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.map((item) => {
                  const doctor = doctors.find(d => d.id === item.doctorId);
                  const membership = item.membership;
                  
                  return (
                    <TableRow key={item.doctorId}>
                      <TableCell>
                        <div className="font-medium">{doctor?.fullName || item.doctorId}</div>
                        {doctor?.specialty && (
                          <div className="text-sm text-gray-600">{doctor.specialty}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {membership ? (
                          <Badge variant="outline">{membership.tier}</Badge>
                        ) : (
                          <span className="text-gray-400">No membership</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {membership ? (
                          <Badge variant={getStatusBadge(membership.status)}>
                            {membership.status}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {membership ? formatDate(membership.startedAt) : '—'}
                      </TableCell>
                      <TableCell>
                        {membership ? (
                          <div>
                            {formatDate(membership.expiresAt)}
                            {new Date(membership.expiresAt) < new Date() && (
                              <Badge variant="destructive" className="ml-2">Expired</Badge>
                            )}
                            {new Date(membership.expiresAt) > new Date() && 
                             new Date(membership.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                              <Badge variant="secondary" className="ml-2">Expiring Soon</Badge>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
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
