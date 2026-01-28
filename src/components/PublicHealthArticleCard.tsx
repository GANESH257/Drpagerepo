import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { PublicHealthArticle } from '@/types';
import { Button } from '@/components/ui/button';

interface PublicHealthArticleCardProps {
  article: PublicHealthArticle;
}

const topicLabels: Record<string, string> = {
  'bird-flu': 'Bird Flu',
  'covid-19': 'COVID-19',
  'influenza': 'Influenza',
  'mental-health': 'Mental Health',
  'heart-disease': 'Heart Disease',
  'diabetes': 'Diabetes',
  'cancer': 'Cancer',
  'hypertension': 'Hypertension',
  'obesity': 'Obesity',
  'asthma': 'Asthma',
  'arthritis': 'Arthritis',
  'alzheimers': "Alzheimer's",
  'parkinsons': "Parkinson's",
  'stroke': 'Stroke',
  'copd': 'COPD',
  'kidney-disease': 'Kidney Disease',
  'liver-disease': 'Liver Disease',
  'osteoporosis': 'Osteoporosis',
  'depression': 'Depression',
  'anxiety': 'Anxiety',
  'substance-abuse': 'Substance Abuse',
  'infectious-diseases': 'Infectious Diseases',
  'autoimmune': 'Autoimmune',
  'nutrition': 'Nutrition',
};

export function PublicHealthArticleCard({ article }: PublicHealthArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card className="h-full card-vibrant group">
      <CardHeader>
        <CardTitle className="text-xl group-hover:text-brand-teal transition-colors">
          <Link href={`/public-health/articles/${article.slug}`}>
            {article.title}
          </Link>
        </CardTitle>
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
          <span className="font-medium">{article.author}</span>
          {article.doctorWritten && (
            <>
              <span className="text-muted-foreground">•</span>
              <Badge variant="vibrant" className="text-xs">
                Doctor-written
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {article.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline" className="text-xs">
              {topicLabels[topic] || topic}
            </Badge>
          ))}
          {article.topics.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{article.topics.length - 3} more
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.readingTime} min read</span>
          </div>
          <span>{formatDate(article.publishDate)}</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
          {article.excerpt}
        </p>
        <Link href={`/public-health/articles/${article.slug}`}>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Read article
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
