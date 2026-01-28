'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { PublicHealthArticle } from '@/types';
import { PublicHealthArticleCard } from './PublicHealthArticleCard';
import { Button } from '@/components/ui/button';

interface ArticleGridProps {
  articles: PublicHealthArticle[];
}

const ARTICLES_PER_PAGE = 9;

export function ArticleGrid({ articles }: ArticleGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', nextPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePrevious = () => {
    const prevPage = currentPage - 1;
    const params = new URLSearchParams(searchParams.toString());
    if (prevPage === 1) {
      params.delete('page');
    } else {
      params.set('page', prevPage.toString());
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No articles found in this category.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedArticles.map((article) => (
          <PublicHealthArticleCard key={article.id} article={article} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={currentPage >= totalPages}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
