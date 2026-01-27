'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from './NewsItem';
import { fallbackNews } from '@/data/medStudentNews';
import { NewsItem as NewsItemType } from '@/types';

// TODO: Configure RSS feed URL in environment variable or constant
const RSS_FEED_URL = process.env.NEXT_PUBLIC_MED_STUDENT_RSS_URL || '';

export function NewsSection() {
  const [news, setNews] = useState<NewsItemType[]>(fallbackNews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!RSS_FEED_URL) {
      // Use fallback if no RSS URL configured
      return;
    }

    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Note: RSS parsing would require a library or API endpoint
        // For static export, we'll use fallback data
        // In production, you might use a CORS proxy or backend service
        const response = await fetch(RSS_FEED_URL, {
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        // TODO: Parse RSS XML response
        // For now, using fallback data
        setNews(fallbackNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Unable to load latest news');
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const displayedNews = news.slice(0, 8);

  return (
    <section className="py-16 md:py-24 relative bg-teal-50 overflow-visible" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46, 196, 182, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26, 75, 127, 0.03) 0%, transparent 50%)' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Latest News for Medical Students
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Stay informed with the latest updates, policy changes, and opportunities in medical education
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading latest news...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4 mb-8">
            <p className="text-sm text-muted-foreground">{error}. Showing archived news.</p>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-4">
          {displayedNews.map((item) => (
            <NewsItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
