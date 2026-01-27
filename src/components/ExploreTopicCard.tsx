import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PreventionTopic } from '@/types';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExploreTopicCardProps {
  topic: PreventionTopic;
}

export function ExploreTopicCard({ topic }: ExploreTopicCardProps) {
  return (
    <Card className="h-full card-vibrant group">
      <CardHeader>
        <CardTitle className="text-xl group-hover:text-brand-teal transition-colors">
          {topic.title}
        </CardTitle>
        <CardDescription className="mt-2">
          {topic.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {topic.resources.map((resource, index) => (
            <div key={index}>
              {resource.type === 'external' ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-brand-teal hover:text-brand-dark-blue hover:underline flex items-center gap-1"
                >
                  {resource.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Link
                  href={resource.url}
                  className="text-sm text-brand-teal hover:text-brand-dark-blue hover:underline"
                >
                  {resource.title}
                </Link>
              )}
            </div>
          ))}
        </div>
        <Link href={`/public-health?wellnessTopic=${topic.slug}`}>
          <Button variant="outline" size="sm" className="w-full">
            Explore {topic.title}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
