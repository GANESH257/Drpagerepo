'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Notification, NotificationType } from '@/types/notifications';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { getNotifications, markNotificationRead } from '@/lib/storage/notificationStorage';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime } from '@/lib/dateUtils';
import { Check } from 'lucide-react';
import Link from 'next/link';

/**
 * Get badge configuration for notification type
 */
function getTypeBadge(type: NotificationType): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  const badges: Record<NotificationType, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    referral_received: { label: 'Referral', variant: 'default' },
    referral_status_changed: { label: 'Referral Update', variant: 'secondary' },
    approval_update: { label: 'Approval', variant: 'outline' },
    practice_roster_update: { label: 'Roster', variant: 'secondary' },
    announcement: { label: 'Announcement', variant: 'outline' },
  };
  return badges[type] || { label: type.replace('_', ' '), variant: 'outline' };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertDoctor(actor);
      
      if (actor.kind !== 'doctor' || !actor.doctorId) {
        throw new PermissionDeniedError('Must be a doctor');
      }
      
      const allNotifications = getNotifications(actor.doctorId);
      setNotifications(allNotifications);
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

  const handleMarkRead = (notificationId: string) => {
    try {
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.doctorId) {
        return;
      }
      
      markNotificationRead(actor.doctorId, notificationId);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.readAt)
    : notifications;

  const unreadCount = notifications.filter(n => !n.readAt).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={!notification.readAt ? 'border-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {!notification.readAt && (
                          <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                        )}
                        <h3 className="font-semibold">{notification.title}</h3>
                        {(() => {
                          const badgeConfig = getTypeBadge(notification.type);
                          return (
                            <Badge variant={badgeConfig.variant} className="text-xs">
                              {badgeConfig.label}
                            </Badge>
                          );
                        })()}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(notification.createdAt)}
                      </p>
                      {notification.href && (
                        <Link href={notification.href}>
                          <Button variant="link" size="sm" className="mt-2">
                            Open
                          </Button>
                        </Link>
                      )}
                    </div>
                    {!notification.readAt && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
