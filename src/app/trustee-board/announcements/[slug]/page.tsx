import Link from 'next/link';
import { notFound } from 'next/navigation';
import { trusteeAnnouncements } from '@/data/trusteeAnnouncements';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericCTASection } from '@/components/GenericCTASection';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return trusteeAnnouncements.map((announcement) => ({
    slug: announcement.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const announcement = trusteeAnnouncements.find((a) => a.slug === slug);

  if (!announcement) {
    return {
      title: 'Announcement Not Found',
    };
  }

  return {
    title: `${announcement.title} - Trustee Board`,
    description: announcement.excerpt,
  };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const announcement = trusteeAnnouncements.find((a) => a.slug === slug);

  if (!announcement) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  return (
    <div className="min-h-screen skin-slate">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/trustee-board">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trustee Board
            </Link>
          </Button>

          {/* Article Header */}
          <article>
            <div className="mb-6">
              <Badge variant={announcement.category === 'Announcement' ? 'gradient' : 'vibrant'}>
                {announcement.category}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue">
              {announcement.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={announcement.date}>
                  {formatDate(announcement.date)}
                </time>
              </div>
              {announcement.source && (
                <span className="text-sm">Source: {announcement.source}</span>
              )}
            </div>

            {/* Content */}
            {announcement.content ? (
              <div
                className="article-content prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {announcement.excerpt}
                </p>
              </div>
            )}

            {/* CTA Section */}
            <GenericCTASection />

            {/* Back Link Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Button variant="gradient" asChild>
                <Link href="/trustee-board">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Trustee Board
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
