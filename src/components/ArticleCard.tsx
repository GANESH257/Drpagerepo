import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { StudentArticle } from '@/types';

interface ArticleCardProps {
  article: StudentArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card className="h-full card-vibrant group">
      <CardHeader>
        <CardTitle className="text-xl group-hover:text-brand-teal transition-colors">
          <Link href={`/medical-students/articles/${article.slug}`}>
            {article.title}
          </Link>
        </CardTitle>
        <div className="mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">{article.authorName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{article.authorSpecialty}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.readingTime} min read</span>
          </div>
          <span>{formatDate(article.publishDate)}</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
          {article.excerpt}
        </p>
        <Link
          href={`/medical-students/articles/${article.slug}`}
          className="text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors"
        >
          Read more →
        </Link>
      </CardContent>
    </Card>
  );
}
