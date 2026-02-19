'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement } from '@/types/announcements';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { getAnnouncementsForDoctor } from '@/lib/services/announcementService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/dateUtils';
import { EmptyState } from '@/components/shared/approvals/EmptyState';
import { Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertDoctor(actor);
      
      if (actor.kind !== 'doctor' || !actor.doctorId) {
        throw new PermissionDeniedError('Must be a doctor');
      }
      
      const allAnnouncements = getAnnouncementsForDoctor(actor, actor.doctorId);
      setAnnouncements(allAnnouncements);
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
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {announcement.audience.kind === 'all_doctors' ? 'All Doctors' : 'Practice Doctors'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(announcement.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{announcement.message}</p>
                <div className="mt-4 text-xs text-gray-500">
                  From: {announcement.createdBy.role === 'admin' ? 'Admin' : 'Practice Admin'}
                  {announcement.createdBy.email && ` (${announcement.createdBy.email})`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
