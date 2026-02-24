'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
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
  getCommunityReports,
  patchCommunityReport,
  type CommunityReport,
} from '@/lib/api/admin-community';
import { deleteCommunityPost } from '@/lib/api/community';

export default function AdminCommunityReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCommunityReports();
      setReports(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDismiss = async (report: CommunityReport) => {
    setActingId(report.id);
    try {
      await patchCommunityReport(report.id, { status: 'dismissed' });
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to dismiss report');
    } finally {
      setActingId(null);
    }
  };

  const handleDeletePost = async (report: CommunityReport) => {
    setActingId(report.id);
    try {
      await deleteCommunityPost(report.post_id);
      await patchCommunityReport(report.id, { status: 'action_taken' });
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete post');
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
        title="Reported Posts Queue"
        description="Review flagged posts; dismiss report or delete post."
      />
      {error && (
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      <div className="glass-card overflow-hidden">
        <div className="p-6">
          {reports.length === 0 ? (
            <p className="text-muted-foreground">No reported posts.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Post</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Section</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Author</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Reported by</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Reason</TableHead>
                  <TableHead className="uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-right uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id} className="hover:bg-accent/30">
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">{r.post_title || '(No title)'}</div>
                        {r.post_body && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {r.post_body}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{r.section ?? '—'}</TableCell>
                    <TableCell>{r.post_author ?? '—'}</TableCell>
                    <TableCell>{r.reporter_name ?? r.reported_by_doctor_id}</TableCell>
                    <TableCell>{r.reason ?? '—'}</TableCell>
                    <TableCell>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10"
                        disabled={!!actingId}
                        onClick={() => handleDismiss(r)}
                      >
                        {actingId === r.id ? '…' : 'Dismiss report'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!!actingId}
                        onClick={() => handleDeletePost(r)}
                      >
                        {actingId === r.id ? '…' : 'Delete post'}
                      </Button>
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
