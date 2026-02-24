import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GenericCTASection } from '@/components/GenericCTASection';
import { getDoctorProfileUrlById } from '@/lib/doctorProfileUrl';
import { studentArticles } from '@/data/medStudentArticles';
import { StudentArticle } from '@/types';

export function generateStaticParams() {
  return studentArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = studentArticles.find((a) => a.slug === params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Medical Students Resources`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishDate,
      authors: [article.authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

interface PageProps {
  params: {
    slug: string;
  };
}

const categoryLabels: Record<StudentArticle['category'], string> = {
  'study-exams': 'Study & Exams',
  'wellness': 'Wellness',
  'research': 'Research',
  'residency': 'Residency',
  'finance': 'Finance',
};

export default function ArticleDetailPage({ params }: PageProps) {
  const article = studentArticles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen skin-tint">
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Back Link */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/medical-students#articles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <Badge variant="vibrant" className="mb-4">
              {categoryLabels[article.category]}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div>
              <span className="font-medium text-foreground">{article.authorName}</span>
              <span className="mx-2">•</span>
              <span>{article.authorSpecialty}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.readingTime} min read</span>
            </div>
            <time dateTime={article.publishDate}>{formatDate(article.publishDate)}</time>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none prose-headings:text-brand-dark-blue prose-a:text-brand-teal prose-a:no-underline hover:prose-a:underline">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Author Info */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-xl font-semibold mb-2">About the Author</h3>
          <p className="text-muted-foreground">
            {article.authorName} is a board-certified physician specializing in {article.authorSpecialty}.
            {article.authorId && (
              <>
                {' '}
                <Link
                  href={getDoctorProfileUrlById(article.authorId)}
                  className="text-brand-teal hover:underline"
                >
                  View their profile
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </div>
      <GenericCTASection />
    </div>
  );
}
