'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAnnouncements, markAnnouncementRead, Announcement } from '@/lib/api/announcements';
import { getEvents } from '@/lib/api/events';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDateTime } from '@/lib/dateUtils';
import { Megaphone, Calendar } from 'lucide-react';

export default function AnnouncementsEventsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ann, ev] = await Promise.all([getAnnouncements(), getEvents()]);
      setAnnouncements(Array.isArray(ann) ? ann : []);
      setEvents(Array.isArray(ev) ? ev : []);
    } catch {
      setAnnouncements([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await markAnnouncementRead(id);
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal" />
      </div>
    );
  }

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements & Events"
        description="Official news, updates, and event calendar"
      />
      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">
            <Megaphone className="h-4 w-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>
        <TabsContent value="announcements" className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">No announcements.</CardContent>
            </Card>
          ) : (
            announcements.map((a) => (
              <Card key={a.id} className={!a.read ? 'border-l-4 border-l-brand-teal' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{a.body}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDateTime(a.created_at)}</p>
                      {!a.read && (
                        <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleMarkRead(a.id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="events" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">No upcoming events.</CardContent>
            </Card>
          ) : (
            upcomingEvents.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{e.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{e.location}</p>
                  <p className="text-sm text-gray-600">{e.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDateTime(e.date)}
                    {e.is_online && ' (Online)'}
                  </p>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-brand-teal text-sm hover:underline">
                      More info
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
