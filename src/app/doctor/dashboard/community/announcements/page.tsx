'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAnnouncements, markAnnouncementRead, Announcement } from '@/lib/api/announcements';
import { getEvents } from '@/lib/api/events';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/dateUtils';
import { Building2, Laptop, PartyPopper, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function eventIcon(title: string, isOnline: boolean) {
  const t = title.toLowerCase();
  if (t.includes('gala') || t.includes('annual')) return PartyPopper;
  if (t.includes('webinar') || isOnline) return Laptop;
  if (t.includes('board') || t.includes('meeting')) return Building2;
  return FileText;
}

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--aip-teal)]" />
      </div>
    );
  }

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-5 relative z-10 max-w-6xl">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Announcements & Events</h1>
        <p className="mt-0.5 text-xs text-gray-600">
          Official news and upcoming events from AIP Administration
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main: announcement cards */}
        <main className="min-w-0 flex-1 space-y-4">
          {announcements.length === 0 ? (
            <div className="glass-card rounded-xl py-12 text-center text-gray-600">
              No announcements.
            </div>
          ) : (
            announcements.map((a) => (
              <article
                key={a.id}
                className={cn(
                  'glass-card rounded-xl overflow-hidden border shadow-sm',
                  !a.read && 'border-l-4'
                )}
                style={!a.read ? { borderLeftColor: 'var(--aip-teal)' } : undefined}
              >
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900">{a.title}</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Posted {formatDate(a.created_at)}
                    {a.created_by ? ` - by ${a.created_by}` : ' - by AIP Administration'}
                  </p>
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                    {a.body}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {!a.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleMarkRead(a.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="rounded-lg bg-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/90 text-white text-sm"
                      onClick={() => handleMarkRead(a.id)}
                    >
                      Read more
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>

        {/* Sidebar: Upcoming Events */}
        <aside className="lg:w-72 shrink-0">
          <div className="glass-card rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900">Upcoming Events</h3>
            {upcomingEvents.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No upcoming events.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {upcomingEvents.map((e) => {
                  const Icon = eventIcon(e.title, e.is_online ?? false);
                  return (
                    <li key={e.id} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm">{e.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatEventDate(e.date)}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {e.is_online ? 'Virtual' : e.location || '—'}
                        </p>
                        {e.url && (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs font-medium hover:underline"
                            style={{ color: 'var(--aip-teal)' }}
                          >
                            More info
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
