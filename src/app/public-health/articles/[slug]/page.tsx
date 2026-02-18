import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicHealthArticles } from '@/data/publicHealthArticles';
import { PublicHealthArticle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GenericCTASection } from '@/components/GenericCTASection';
import { Clock, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return publicHealthArticles.map((article) => ({
    slug: article.slug,
  }));
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

function generateTableOfContents(content: string): Array<{ id: string; text: string }> {
  const headings: Array<{ id: string; text: string }> = [];
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    headings.push({ id, text });
  }

  return headings;
}

function extractKeyTakeaways(content: string): string[] {
  // Simple extraction - look for lists or key phrases
  // In a real implementation, this could be more sophisticated
  const takeaways: string[] = [];
  const listRegex = /<li[^>]*>(.*?)<\/li>/gi;
  let match;
  let count = 0;

  while ((match = listRegex.exec(content)) !== null && count < 5) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text.length > 20 && text.length < 200) {
      takeaways.push(text);
      count++;
    }
  }

  // If no lists found, create generic takeaways
  if (takeaways.length === 0) {
    takeaways.push('Consult with your healthcare provider for personalized guidance');
    takeaways.push('Early detection and prevention are key to maintaining good health');
    takeaways.push('Stay informed about the latest medical research and guidelines');
  }

  return takeaways.slice(0, 4);
}

function findRelatedArticles(currentArticle: PublicHealthArticle, allArticles: PublicHealthArticle[]): PublicHealthArticle[] {
  // Find articles with matching topics
  const related = allArticles
    .filter(article => 
      article.id !== currentArticle.id &&
      article.topics.some(topic => currentArticle.topics.includes(topic))
    )
    .slice(0, 3);

  // If not enough related articles, fill with any other articles
  if (related.length < 3) {
    const additional = allArticles
      .filter(article => 
        article.id !== currentArticle.id &&
        !related.some(r => r.id === article.id)
      )
      .slice(0, 3 - related.length);
    return [...related, ...additional];
  }

  return related;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = publicHealthArticles.find(a => a.slug === params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Public Health`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default function ArticleDetailPage({ params }: PageProps) {
  const article = publicHealthArticles.find(a => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const toc = generateTableOfContents(article.content);
  const takeaways = extractKeyTakeaways(article.content);
  const relatedArticles = findRelatedArticles(article, publicHealthArticles);

  return (
    <div className="min-h-screen skin-slate">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link
            href="/public-health#disease-topics"
            className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-dark-blue mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Public Health
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {article.topics.map((topic) => (
                  <Badge key={topic} variant="colorful">
                    {topicLabels[topic] || topic}
                  </Badge>
                ))}
                {article.doctorWritten && (
                  <Badge variant="vibrant">Doctor-written</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-dark-blue">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span className="font-medium">{article.author}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.readingTime} min read</span>
                </div>
                <span>•</span>
                <time dateTime={article.publishDate}>{formatDate(article.publishDate)}</time>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Table of Contents */}
                {toc.length > 0 && (
                  <Card className="mb-8 card-vibrant">
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue">Table of Contents</h2>
                      <nav>
                        <ol className="space-y-2">
                          {toc.map((item) => (
                            <li key={item.id}>
                              <a
                                href={`#${item.id}`}
                                className="text-brand-teal hover:text-brand-dark-blue hover:underline"
                              >
                                {item.text}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </nav>
                    </CardContent>
                  </Card>
                )}

                {/* Article Content */}
                <article className="prose prose-lg max-w-none article-content mb-8">
                  {article.content.split('<h2').map((section, index) => {
                    if (index === 0) {
                      return <div key={index} dangerouslySetInnerHTML={{ __html: section }} />;
                    }
                    const match = section.match(/^[^>]*>(.*?)<\/h2>/);
                    if (match) {
                      const headingText = match[1].replace(/<[^>]*>/g, '').trim();
                      const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <div key={index} id={id}>
                          <div dangerouslySetInnerHTML={{ __html: '<h2' + section }} />
                        </div>
                      );
                    }
                    return <div key={index} dangerouslySetInnerHTML={{ __html: '<h2' + section }} />;
                  })}
                </article>

                {/* Key Takeaways */}
                {takeaways.length > 0 && (
                  <Card className="mb-8 border-brand-teal bg-teal-50">
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue">Key Takeaways</h2>
                      <ul className="space-y-2">
                        {takeaways.map((takeaway, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-brand-teal font-bold mt-1">•</span>
                            <span className="text-gray-700">{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* When to Seek Care */}
                <Card className="mb-8 card-vibrant">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-brand-dark-blue">When to Seek Care</h2>
                    <p className="text-gray-700 mb-2">
                      If you experience concerning symptoms or have questions about your health, consult with a healthcare provider. This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                    <p className="text-sm text-gray-600">
                      For emergencies, call 911 or go to your nearest emergency room immediately.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {toc.length > 0 && (
                  <div className="sticky top-24">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-brand-dark-blue">Contents</h3>
                        <nav>
                          <ol className="space-y-2 text-sm">
                            {toc.map((item) => (
                              <li key={item.id}>
                                <a
                                  href={`#${item.id}`}
                                  className="text-brand-teal hover:text-brand-dark-blue hover:underline"
                                >
                                  {item.text}
                                </a>
                              </li>
                            ))}
                          </ol>
                        </nav>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <GenericCTASection />

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6 text-brand-dark-blue">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <Card key={relatedArticle.id} className="h-full card-vibrant group">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-teal transition-colors">
                          <Link href={`/public-health/articles/${relatedArticle.slug}`}>
                            {relatedArticle.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {relatedArticle.excerpt}
                        </p>
                        <Link href={`/public-health/articles/${relatedArticle.slug}`}>
                          <Button variant="gradient" size="sm">
                            Read article
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
