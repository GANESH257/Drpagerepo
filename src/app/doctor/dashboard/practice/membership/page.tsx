'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { getPracticeMemberships } from '@/lib/api/memberships';
import { getDoctor } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/dateUtils';
import { Users, AlertCircle } from 'lucide-react';

type MembershipRow = {
  doctorId: string;
  doctorName: string;
  planName: string;
  status: string;
  startDate: string;
  expiryDate: string;
  isExpired: boolean;
  expiringSoon: boolean;
};

export default function PracticeMembershipOverviewPage() {
  const router = useRouter();
  const [rows, setRows] = useState<MembershipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const actor = getActorFromSession();
        assertPracticeAdmin(actor);

        if (actor.kind !== 'doctor' || !actor.practiceId) {
          throw new PermissionDeniedError('Practice admin must have practiceId');
        }

        const token = getToken();
        if (!token) throw new Error('Authentication required');

        const memberships = await getPracticeMemberships(actor.practiceId);
        if (cancelled) return;

        // Dedupe by doctor_id (keep most recent per doctor)
        const byDoctor = new Map<string, typeof memberships[0]>();
        for (const m of memberships) {
          const did = m.doctor_id ?? (m as any).doctorId;
          if (did && !byDoctor.has(did)) byDoctor.set(did, m);
        }

        const doctorIds = Array.from(byDoctor.keys());
        const doctorNames: Record<string, string> = {};
        await Promise.all(
          doctorIds.map(async (id) => {
            try {
              const doc = await getDoctor(id, token);
              if (!cancelled) doctorNames[id] = doc.fullName || doc.id;
            } catch {
              if (!cancelled) doctorNames[id] = id;
            }
          })
        );

        if (cancelled) return;

        const next: MembershipRow[] = [];
        for (const [doctorId, m] of byDoctor.entries()) {
          const startDate = m.start_date ?? (m as any).startDate ?? '';
          const expiryDate = m.expiry_date ?? '';
          const exp = expiryDate ? new Date(expiryDate) : new Date(0);
          const now = new Date();
          const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          next.push({
            doctorId,
            doctorName: doctorNames[doctorId] ?? doctorId,
            planName: m.plan_name ?? (m as any).plan_name ?? '—',
            status: (m.status ?? 'active').toLowerCase(),
            startDate,
            expiryDate,
            isExpired: !!expiryDate && exp < now,
            expiringSoon: !!expiryDate && exp >= now && exp < thirtyDays,
          });
        }

        next.sort((a, b) => a.doctorName.localeCompare(b.doctorName));
        setRows(next);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof AuthRequiredError) {
          router.push('/join-us');
          return;
        }
        if (e instanceof PermissionDeniedError) {
          router.push('/doctor/dashboard');
          return;
        }
        setError(e instanceof Error ? e.message : 'Failed to load membership overview');
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [router]);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'active') return 'default';
    if (status === 'expired' || status === 'cancelled') return 'destructive';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[var(--aip-teal)] border-t-transparent" />
          <p className="text-gray-600">Loading membership overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Practice Membership Overview"
        description="View membership status for all doctors in your practice"
      />

      {error && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {rows.length === 0 && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-4 h-14 w-14 text-gray-300" />
            <p className="font-medium text-gray-600">No membership records</p>
            <p className="mt-1 text-sm text-gray-500">
              When doctors in your practice have memberships, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-gray-50/80">
                  <TableHead className="font-semibold">Doctor</TableHead>
                  <TableHead className="font-semibold">Plan</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Start date</TableHead>
                  <TableHead className="font-semibold">Expiry date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.doctorId} className="border-b last:border-0">
                    <TableCell className="font-medium text-gray-900">{row.doctorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {row.planName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.isExpired ? 'destructive' : getStatusVariant(row.status)}>
                        {row.isExpired ? 'Expired' : row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {row.startDate ? formatDate(row.startDate) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-gray-600">
                          {row.expiryDate ? formatDate(row.expiryDate) : '—'}
                        </span>
                        {row.expiringSoon && (
                          <Badge variant="secondary" className="text-xs">Expiring soon</Badge>
                        )}
                      </div>
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
