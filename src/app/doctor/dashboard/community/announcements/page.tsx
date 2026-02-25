'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getAnnouncements, markAnnouncementRead, Announcement } from '@/lib/api/announcements';
import { getEvents } from '@/lib/api/events';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/dateUtils';
import { Building2, Laptop, PartyPopper, FileText, AlertCircle, RefreshCw, Megaphone, CalendarDays } from 'lucide-react';
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

/**
 * Doctor dashboard: Community → Announcements & Events.
 * Read-only: doctors see announcements and upcoming events only.
 * Admins create/edit events in Admin → Events (/admin/events).
 */
export default function AnnouncementsEventsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [annError, setAnnError] = useState<string | null>(null);
  const [evError, setEvError] = useState<string | null>(null);

  const didMarkAnnouncementsReadOnVisit = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setAnnError(null);
    setEvError(null);

    const [annResult, evResult] = await Promise.allSettled([
      getAnnouncements(),
      getEvents(),
    ]);

    if (annResult.status === 'fulfilled') {
      const list = Array.isArray(annResult.value) ? annResult.value : [];
      setAnnouncements(list);
      // When user landed here by clicking announcement nav/bell, mark all read so badge goes to 0 (once per visit)
      if (!didMarkAnnouncementsReadOnVisit.current && list.length > 0) {
        const unread = list.filter((a) => a.read !== true);
        if (unread.length > 0) {
          didMarkAnnouncementsReadOnVisit.current = true;
          try {
            await Promise.all(unread.map((a) => markAnnouncementRead(a.id)));
            setAnnouncements((prev) => prev.map((a) => ({ ...a, read: true })));
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('announcements-marked-read'));
          } catch {
            didMarkAnnouncementsReadOnVisit.current = false;
          }
        }
      }
    } else {
      console.error('[AnnouncementsPage] announcements error:', annResult.reason);
      setAnnError(annResult.reason?.message || 'Failed to load announcements');
      setAnnouncements([]);
    }

    if (evResult.status === 'fulfilled') {
      setEvents(Array.isArray(evResult.value) ? evResult.value : []);
    } else {
      console.error('[AnnouncementsPage] events error:', evResult.reason);
      setEvError(evResult.reason?.message || 'Failed to load events');
      setEvents([]);
    }

    setLoading(false);
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
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--aip-teal)]" />
        <p className="text-sm text-gray-500">Loading announcements & events…</p>
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
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Announcements & Events</h1>
          <p className="mt-0.5 text-xs text-gray-600">
            Official news and upcoming events from AIP Administration
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="shrink-0 flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main: announcement cards */}
        <main className="min-w-0 flex-1 space-y-4">
          {annError ? (
            <div className="glass-card rounded-xl p-6 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Could not load announcements</p>
                <p className="text-xs text-gray-500 mt-1">{annError}</p>
              </div>
              <Button size="sm" variant="outline" onClick={load} className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="glass-card rounded-xl py-14 flex flex-col items-center gap-3 text-center px-6">
              <div className="h-14 w-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(26,140,122,0.1)' }}>
                <Megaphone className="h-7 w-7" style={{ color: 'var(--aip-teal)' }} />
              </div>
              <p className="font-semibold text-gray-900">No announcements yet</p>
              <p className="text-sm text-gray-500">Check back later for updates from AIP Administration.</p>
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
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{a.title}</h2>
                    {!a.read && (
                      <span
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: 'var(--aip-teal)' }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Posted {formatDate(a.created_at)}
                    {a.created_by ? ` — by ${a.created_by}` : ' — by AIP Administration'}
                  </p>
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                    {a.body}
                  </p>
                  {!a.read && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleMarkRead(a.id)}
                      >
                        Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </main>

        {/* Sidebar: Upcoming Events (read-only for doctors) */}
        <aside className="lg:w-72 shrink-0">
          <div className="glass-card rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" style={{ color: 'var(--aip-teal)' }} />
              Upcoming Events
            </h3>
            {evError ? (
              <div className="mt-3 flex flex-col items-center gap-2 text-center py-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-xs text-gray-500">{evError}</p>
                <Button size="sm" variant="outline" onClick={load} className="text-xs flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No upcoming events scheduled.</p>
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
