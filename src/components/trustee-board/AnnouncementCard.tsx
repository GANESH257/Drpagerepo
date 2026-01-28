'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { TrusteeAnnouncement } from '@/types';

interface AnnouncementCardProps {
  announcement: TrusteeAnnouncement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Announcement':
        return 'bg-brand-teal text-white';
      case 'Notice':
        return 'bg-brand-dark-blue text-white';
      case 'Update':
        return 'bg-blue-500 text-white';
      case 'Policy':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const isInternalLink = announcement.url && !announcement.url.startsWith('http');

  return (
    <Card className="h-full card-vibrant">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Category Badge & Date */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant={announcement.category === 'Announcement' ? 'gradient' : 'vibrant'}>
            {announcement.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <time dateTime={announcement.date}>{formatDate(announcement.date)}</time>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-3 text-brand-dark-blue hover:text-brand-teal transition-colors line-clamp-2 flex-1">
          {isInternalLink ? (
            <Link href={announcement.url!} className="hover:underline">
              {announcement.title}
            </Link>
          ) : (
            announcement.title
          )}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-grow">
          {announcement.excerpt}
        </p>

        {/* Read More Link */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {isInternalLink ? (
            <Link
              href={announcement.url!}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors group"
            >
              Read more
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : announcement.url ? (
            <a
              href={announcement.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors group"
            >
              Read more
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
