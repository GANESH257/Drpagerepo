'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  getCommunityModerationList,
  setUserModeration,
  type ModeratedUser,
} from '@/lib/api/admin-community';

export default function AdminCommunityUsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<ModeratedUser[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommunityModerationList();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (
    doctorId: string,
    status: 'active' | 'suspended' | 'banned'
  ) => {
    setActingId(doctorId);
    try {
      await setUserModeration(doctorId, { status });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User Moderation"
        description="Suspend or ban users from the community forum."
      />
      {error && (
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      <div className="glass-card overflow-hidden">
        <div className="p-6">
          {list.length === 0 ? (
            <p className="text-muted-foreground">No moderated users. Only users with suspension or ban appear here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Doctor</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Reason</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Until</TableHead>
                  <TableHead className="text-right uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((u) => (
                  <TableRow key={u.id} className="hover:bg-accent/30">
                    <TableCell>{u.full_name ?? u.doctor_id}</TableCell>
                    <TableCell>{u.email ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell>{u.reason ?? '—'}</TableCell>
                    <TableCell>
                      {u.until
                        ? new Date(u.until).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {u.status !== 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10"
                          disabled={!!actingId}
                          onClick={() => handleStatus(u.doctor_id, 'active')}
                        >
                          {actingId === u.doctor_id ? '…' : 'Restore'}
                        </Button>
                      )}
                      {u.status !== 'suspended' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!!actingId}
                          onClick={() => handleStatus(u.doctor_id, 'suspended')}
                        >
                          {actingId === u.doctor_id ? '…' : 'Suspend'}
                        </Button>
                      )}
                      {u.status !== 'banned' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!!actingId}
                          onClick={() => handleStatus(u.doctor_id, 'banned')}
                        >
                          {actingId === u.doctor_id ? '…' : 'Ban'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
