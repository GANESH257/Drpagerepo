'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { publicHealthNews } from '@/data/publicHealthNews';
import { publicHealthArticles } from '@/data/publicHealthArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, ArrowRight, Clock, FileText } from 'lucide-react';

export function NewsAndArticlesCombined() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Safety checks for data - reduced to 4 items each
  const latestNews = Array.isArray(publicHealthNews) ? publicHealthNews.slice(0, 4) : [];
  const latestArticles = Array.isArray(publicHealthArticles)
    ? [...publicHealthArticles]
        .sort((a, b) => {
          const dateA = a?.publishDate ? new Date(a.publishDate).getTime() : 0;
          const dateB = b?.publishDate ? new Date(b.publishDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 4)
    : [];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTopicLabel = (topic: string) => {
    return topic
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const animationStyle = (delay: number) => {
    if (prefersReducedMotion) {
      return {
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      };
    }
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="news-and-articles"
      className="py-16 md:py-24 relative skin-slate overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16" style={animationStyle(0)}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-brand-dark-blue">
            Latest Public Health News & Articles
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest public health updates and evidence-based articles from trusted sources.
          </p>
        </div>

        {/* Two Column Layout: News (Left) and Articles (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Latest News */}
          <div className="relative rounded-2xl overflow-hidden" style={animationStyle(200)}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/bgnews.png"
                alt="News Background"
                fill
                className="object-cover"
              />
            </div>
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-white/95 z-10" />
            
            <div className="relative z-20 p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-brand-dark-blue">
                  Latest Public Health News
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Stay informed with the latest public health updates and medical news from trusted sources.
                </p>
              </div>

            <div className="space-y-4">
              {latestNews && latestNews.length > 0 ? (
                latestNews.map((item, index) => {
                  if (!item) return null;
                  const cardDelay = prefersReducedMotion ? 0 : index * 100;
                  return (
                    <Card
                      key={`news-${index}`}
                      className="card-vibrant focus-ring group hover:shadow-lg transition-all duration-300"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion
                          ? 'translateX(0) scale(1)'
                          : 'translateX(-20px) scale(0.95)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay}ms`
                          : `opacity 0.7s ease-out ${cardDelay}ms, transform 0.7s ease-out ${cardDelay}ms`,
                      }}
                    >
                      <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.source || 'News'}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{item.date ? formatDate(item.date) : 'Recent'}</span>
                            </div>
                          </div>
                          <h4 className="text-base md:text-lg font-semibold text-brand-dark-blue group-hover:text-brand-teal transition-colors line-clamp-2">
                            {item.headline || 'News Update'}
                          </h4>
                          {item.excerpt && (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                              {item.excerpt}
                            </p>
                          )}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors mt-1"
                            >
                              Read more
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No news available at this time.</p>
              )}
            </div>

              <div className="mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white focus-ring transition-all duration-200 w-full sm:w-auto"
                >
                  <Link href="/public-health#latest-news">
                    View More News
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Latest Articles */}
          <div className="relative rounded-2xl overflow-hidden" style={animationStyle(400)}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/bg_art.png"
                alt="Articles Background"
                fill
                className="object-cover"
              />
            </div>
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-white/95 z-10" />
            
            <div className="relative z-20 p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-brand-dark-blue">
                  Latest Articles & Insights
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Evidence-based articles and insights from our physician network on public health topics, prevention, and wellness.
                </p>
              </div>

            <div className="space-y-4">
              {latestArticles && latestArticles.length > 0 ? (
                latestArticles.map((article, index) => {
                  if (!article) return null;
                  const cardDelay = prefersReducedMotion ? 0 : index * 100;
                  const primaryTopic = article.topics && article.topics.length > 0 ? article.topics[0] : 'general';

                  return (
                    <Card
                      key={article.id || `article-${index}`}
                      className="card-vibrant focus-ring group hover:shadow-lg transition-all duration-300"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible && !prefersReducedMotion
                          ? 'translateX(0) scale(1)'
                          : 'translateX(20px) scale(0.95)',
                        transition: prefersReducedMotion
                          ? `opacity 0.3s ease ${cardDelay}ms`
                          : `opacity 0.7s ease-out ${cardDelay}ms, transform 0.7s ease-out ${cardDelay}ms`,
                      }}
                    >
                      <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-xs border-brand-teal text-brand-teal"
                            >
                              {formatTopicLabel(primaryTopic)}
                            </Badge>
                            {article.doctorWritten && (
                              <Badge variant="secondary" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Doctor-written
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-base md:text-lg font-semibold text-brand-dark-blue group-hover:text-brand-teal transition-colors line-clamp-2">
                            {article.title || 'Article'}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                            <span>{article.author || 'Author'}</span>
                            {article.readingTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{article.readingTime} min read</span>
                              </div>
                            )}
                          </div>
                          {article.excerpt && (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {article.publishDate ? formatDate(article.publishDate) : 'Recent'}
                            </span>
                            {article.slug && (
                              <Link
                                href={`/public-health/articles/${article.slug}`}
                                className="flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors focus-ring rounded-md px-1 -ml-1"
                              >
                                Read article
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No articles available at this time.</p>
              )}
            </div>

              <div className="mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white focus-ring transition-all duration-200 w-full sm:w-auto"
                >
                  <Link href="/public-health/articles">
                    View All Articles
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
