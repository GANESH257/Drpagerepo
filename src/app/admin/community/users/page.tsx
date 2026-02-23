'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">User Moderation</h2>
        <p className="text-gray-600 mt-1">Suspend or ban users from the community forum.</p>
      </div>
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6">
          {list.length === 0 ? (
            <p className="text-gray-600">No moderated users. Only users with suspension or ban appear here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Until</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.full_name ?? u.doctor_id}</TableCell>
                    <TableCell>{u.email ?? '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.status === 'banned'
                            ? 'destructive'
                            : u.status === 'suspended'
                              ? 'secondary'
                              : 'default'
                        }
                      >
                        {u.status}
                      </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
