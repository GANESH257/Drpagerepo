'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnnouncementCard } from './AnnouncementCard';
import { trusteeAnnouncements } from '@/data/trusteeAnnouncements';
import { TrusteeAnnouncement } from '@/types';
import { Newspaper, AlertCircle } from 'lucide-react';

// TODO: Configure RSS feed URL in environment variable or constant
const RSS_FEED_URL = process.env.NEXT_PUBLIC_TRUSTEE_ANNOUNCEMENTS_RSS || '';

export function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<TrusteeAnnouncement[]>(trusteeAnnouncements);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!RSS_FEED_URL) {
      // Use fallback if no RSS URL configured
      return;
    }

    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Implement RSS parsing library if needed
        // For static export, we'll use fallback data
        // In production, you might use a CORS proxy or backend service
        const response = await fetch(RSS_FEED_URL, {
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml, application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }

        // TODO: Parse RSS XML or JSON response
        // For now, using fallback data
        setAnnouncements(trusteeAnnouncements);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Unable to load latest announcements');
        setAnnouncements(trusteeAnnouncements);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const displayedAnnouncements = announcements.slice(0, 10);

  return (
    <section id="announcements" className="py-16 md:py-24 relative bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-teal/10 mb-4">
            <Newspaper className="h-8 w-8 text-brand-teal" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Latest Announcements & Notices
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Stay informed about important updates, policy changes, and board decisions
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-800">{error}. Showing archived announcements.</p>
            </div>
          </div>
        )}

        {/* Announcements Grid */}
        {!loading && (
          <>
            {displayedAnnouncements.length > 0 ? (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedAnnouncements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Newspaper className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No announcements</h3>
                <p className="text-gray-600">Check back soon for updates</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
