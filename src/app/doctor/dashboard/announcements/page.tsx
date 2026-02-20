'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement } from '@/types/announcements';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { subscribeToAnnouncements, markAnnouncementAsRead } from '@/lib/services/announcementService';
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
  const [announcements, setAnnouncements] = useState<(Announcement & { isRead?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      const actor = getActorFromSession();
      assertDoctor(actor);

      if (actor.kind !== 'doctor' || !actor.doctorId) {
        throw new PermissionDeniedError('Must be a doctor');
      }

      setDoctorId(actor.doctorId);

      // Subscribe to real-time announcements
      unsubscribe = subscribeToAnnouncements(actor.doctorId, actor.practiceId, (all) => {
        setAnnouncements(all);
        setIsLoading(false);
      });
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/doctor/dashboard');
      }
      setIsLoading(false);
    }

    return () => unsubscribe?.();
  }, [router]);

  const handleMarkAsRead = async (announcementId: string) => {
    if (!doctorId) return;
    try {
      await markAnnouncementAsRead(doctorId, announcementId);
    } catch (err) {
      console.error('[AnnouncementsPage] Failed to mark as read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
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
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={cn(
              "transition-all duration-200",
              !announcement.isRead ? "border-l-4 border-l-brand-dark-blue shadow-md" : "border-gray-200 shadow-sm"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {!announcement.isRead && (
                        <Badge className="bg-brand-dark-blue hover:bg-brand-dark-blue/90 animate-pulse">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {announcement.audience.kind === 'all_doctors' ? 'Global' : 'Internal'}
                      </Badge>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {formatDateTime(announcement.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!announcement.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(announcement.id)}
                      className="text-xs h-8 border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/10"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {announcement.message}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[10px] text-gray-400 font-medium">
                    From: <span className="text-gray-600">{announcement.createdBy.role === 'admin' ? 'Alliance Admin' : 'Practice Admin'}</span>
                    {announcement.createdBy.email && (
                      <span className="ml-1 text-gray-400">({announcement.createdBy.email})</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
