'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { publicHealthArticles } from '@/data/publicHealthArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export function LatestArticlesPreviewSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Get latest 6 articles, sorted by publish date (most recent first)
  const latestArticles = [...publicHealthArticles]
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 6);

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

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [isVisible]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.article-card')?.clientWidth || 350;
      scrollContainerRef.current.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector('.article-card')?.clientWidth || 350;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="py-16 md:py-20 lg:py-24 relative skin-slate overflow-hidden"
    >

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-brand-dark-blue"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1.5s ease-out 0.4s, transform 1.5s ease-out 0.4s',
            }}
          >
            Latest Articles & Insights
          </h2>
          <p 
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
            }}
          >
            Evidence-based articles and insights from our physician network on public health topics, prevention, and wellness.
          </p>
        </div>

        {/* Horizontal Scrolling Articles Container */}
        <div className="relative mb-8">
          {/* Left Arrow Button (Desktop Only) */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white border-2 border-gray-200 shadow-lg hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-all duration-200 focus-ring disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory -mx-4 px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-6">
              {latestArticles.map((article, index) => {
                const cardDelay = prefersReducedMotion ? 0 : index * 300;
                const primaryTopic = article.topics[0] || 'general';
                
                return (
                  <Card
                    key={article.id}
                    className="article-card flex-shrink-0 w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(25%-1.5rem)] h-full card-vibrant focus-ring group snap-start"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible && !prefersReducedMotion
                        ? 'translateX(0) scale(1)' 
                        : 'translateX(50px) scale(0.95)',
                      transition: prefersReducedMotion
                        ? `opacity 0.3s ease ${cardDelay}ms`
                        : `opacity 0.7s ease-out ${cardDelay}ms, transform 0.7s ease-out ${cardDelay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 h-full">
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
                        <h3 className="text-lg font-semibold text-brand-dark-blue group-hover:text-brand-teal transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{article.author}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.readingTime} min read</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-grow">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs text-gray-500">
                            {formatDate(article.publishDate)}
                          </span>
                          <Link
                            href={`/public-health/articles/${article.slug}`}
                            className="flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors focus-ring rounded-md px-1 -ml-1"
                          >
                            Read article
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Arrow Button (Desktop Only) */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white border-2 border-gray-200 shadow-lg hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-all duration-200 focus-ring disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* View More Link */}
        <div 
          className="text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible && !prefersReducedMotion ? 'translateY(0)' : 'translateY(15px)',
            transition: prefersReducedMotion ? 'opacity 0.3s ease' : 'opacity 1.5s ease-out 1.2s, transform 1.5s ease-out 1.2s',
          }}
        >
          <Button
            asChild
            variant="outline"
            className="border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue hover:text-white focus-ring transition-all duration-200 hover:scale-105"
          >
            <Link href="/public-health/articles">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
