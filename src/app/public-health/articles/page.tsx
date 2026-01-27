import Link from 'next/link';
import { publicHealthArticles } from '@/data/publicHealthArticles';
import { PublicHealthArticleCard } from '@/components/PublicHealthArticleCard';
import { GenericCTASection } from '@/components/GenericCTASection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Public Health Articles | Alliance of Independent Physicians',
  description: 'Browse articles and resources about public health topics, written by physicians and health experts.',
};

export default function ArticlesIndexPage() {
  return (
    <div className="min-h-screen skin-slate">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-brand-dark-blue">
              Public Health Articles
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl">
              Explore evidence-based articles and resources covering a wide range of public health topics, written by experienced physicians and health experts.
            </p>
            <Link
              href="/public-health"
              className="inline-block mt-4 text-brand-teal hover:text-brand-dark-blue hover:underline"
            >
              ← Back to Public Health
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicHealthArticles.map((article) => (
              <PublicHealthArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
      <GenericCTASection />
    </div>
  );
}
