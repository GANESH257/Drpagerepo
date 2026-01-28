import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { NewsItem as NewsItemType } from '@/types';

interface NewsItemProps {
  item: NewsItemType;
}

export function NewsItem({ item }: NewsItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <article className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 hover:text-brand-teal transition-colors">
            <Link
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {item.headline}
            </Link>
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            <Badge variant="outline" className="text-xs">
              {item.source}
            </Badge>
          </div>
        </div>
      </div>
    </article>
  );
}
