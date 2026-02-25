'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { getAnnouncements, markAnnouncementRead, Announcement } from '@/lib/api/announcements';
import { cn } from '@/lib/utils';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/dateUtils';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const didMarkAllReadOnVisit = useRef(false);

  const load = useCallback(async () => {
    try {
      const list = await getAnnouncements();
      setAnnouncements(Array.isArray(list) ? list : []);
    } catch {
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertDoctor(actor);
      if (actor.kind !== 'doctor') throw new PermissionDeniedError('Must be a doctor');
      load();
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/doctor/dashboard');
      }
      setIsLoading(false);
    }
  }, [router, load]);

  // When user lands on this page (e.g. clicked nav/header bell), mark all as read so badge clears (once per visit)
  useEffect(() => {
    if (isLoading || didMarkAllReadOnVisit.current) return;
    const unread = announcements.filter((a) => a.read !== true);
    if (unread.length === 0) return;
    didMarkAllReadOnVisit.current = true;
    let mounted = true;
    (async () => {
      try {
        await Promise.all(unread.map((a) => markAnnouncementRead(a.id)));
        if (mounted) {
          setAnnouncements((prev) =>
            prev.map((a) => ({ ...a, read: true }))
          );
          window.dispatchEvent(new CustomEvent('announcements-marked-read'));
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [isLoading, announcements]);

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await markAnnouncementRead(announcementId);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcementId ? { ...a, read: true } : a))
      );
    } catch (err) {
      console.error('[AnnouncementsPage] Failed to mark as read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aip-teal)] mx-auto mb-4" />
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements"
        description="Important updates and announcements"
      />

      {announcements.length === 0 ? (
        <EmptyState
          title="No announcements"
          description="There are no announcements at this time."
          icon={<Megaphone className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const isRead = announcement.read ?? false;
            return (
              <Card
                key={announcement.id}
                className={cn(
                  'transition-all duration-200',
                  !isRead
                    ? 'border-l-4 border-l-[var(--aip-teal)] shadow-md'
                    : 'border-gray-200 shadow-sm'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        {!isRead && (
                          <Badge className="animate-pulse text-white" style={{ background: 'var(--aip-teal)' }}>
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5">
                          {announcement.audience_type === 'all' ? 'Global' : 'Internal'}
                        </Badge>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {formatDateTime(announcement.created_at)}
                        </span>
                      </div>
                    </div>
                    {!isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(announcement.id)}
                        className="text-xs h-8 rounded-lg"
                        style={{ borderColor: 'var(--aip-teal)', color: 'var(--aip-teal)' }}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {announcement.body}
                  </p>
                  {announcement.created_by && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-[10px] text-gray-400 font-medium">
                        From: <span className="text-gray-600">Alliance</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
