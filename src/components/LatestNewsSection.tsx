'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { publicHealthNews } from '@/data/publicHealthNews';
import { PublicHealthNewsItem } from '@/types';
import { ExternalLink, Search, Calendar, Newspaper, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// TODO: Configure RSS feed URL in environment variable or constant
const RSS_FEED_URL = process.env.NEXT_PUBLIC_PUBLIC_HEALTH_RSS_URL || '';

export function LatestNewsSection() {
  const [news, setNews] = useState<PublicHealthNewsItem[]>(publicHealthNews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set(['all']));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!RSS_FEED_URL) {
      // Use fallback if no RSS URL configured
      return;
    }

    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Note: RSS parsing would require a library or API endpoint
        // For static export, we'll use fallback data
        // In production, you might use a CORS proxy or backend service
        const response = await fetch(RSS_FEED_URL, {
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        // TODO: Parse RSS XML response
        // For now, using fallback data
        setNews(publicHealthNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Unable to load latest news');
        setNews(publicHealthNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Get unique sources for filter
  const sources = useMemo(() => {
    const uniqueSources = Array.from(new Set(news.map(item => item.source)));
    return uniqueSources.sort();
  }, [news]);

  // Handle source selection
  const handleSourceToggle = (source: string) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      
      if (source === 'all') {
        // If "All Sources" is clicked, toggle it
        if (newSet.has('all')) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add('all');
        }
      } else {
        // Remove 'all' if a specific source is selected
        newSet.delete('all');
        
        if (newSet.has(source)) {
          newSet.delete(source);
          // If no sources selected, add 'all'
          if (newSet.size === 0) {
            newSet.add('all');
          }
        } else {
          newSet.add(source);
        }
      }
      
      return newSet;
    });
  };

  // Filter news based on search query and sources
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSource = selectedSources.has('all') || selectedSources.has(item.source);
      
      return matchesSearch && matchesSource;
    });
  }, [news, searchQuery, selectedSources]);

  const displayedNews = filteredNews.slice(0, 12);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  return (
    <section id="latest-news" className="py-16 md:py-24 relative bg-gradient-to-br from-brand-dark-blue via-brand-dark-blue/95 to-brand-teal/30 overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Latest Medical News
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Stay informed with the latest updates, research findings, and public health announcements from trusted sources
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-white/20 bg-white/10 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                  <Input
                    type="text"
                    placeholder="Search news by topic, keyword, or source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-white/50"
                  />
                </div>
                
                {/* Source Filter Dropdown with Checkboxes */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-12 px-4 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm text-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 flex items-center gap-2 min-w-[180px] justify-between hover:bg-white/20 transition-colors"
                  >
                    <span>
                      {selectedSources.has('all') || selectedSources.size === 0
                        ? 'All Sources'
                        : `${selectedSources.size} Selected`}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
                  </button>
                  
                  {isDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                        <div className="p-2">
                          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                            <span className="text-sm font-semibold text-gray-900">Filter by Source</span>
                            {selectedSources.size > 0 && !selectedSources.has('all') && (
                              <button
                                onClick={() => {
                                  setSelectedSources(new Set(['all']));
                                }}
                                className="text-xs text-brand-teal hover:text-brand-dark-blue"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          
                          <div className="py-2">
                            <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded">
                              <Checkbox
                                checked={selectedSources.has('all')}
                                onCheckedChange={() => handleSourceToggle('all')}
                              />
                              <span className="text-sm text-gray-900 font-medium">All Sources</span>
                            </label>
                            
                            {sources.map((source) => (
                              <label
                                key={source}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
                              >
                                <Checkbox
                                  checked={selectedSources.has(source)}
                                  onCheckedChange={() => handleSourceToggle(source)}
                                />
                                <span className="text-sm text-gray-700">{source}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Results Count */}
              {searchQuery || (!selectedSources.has('all') && selectedSources.size > 0) ? (
                <div className="mt-4 text-sm text-white/90">
                  Found {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {!selectedSources.has('all') && selectedSources.size > 0 && (
                    <span className="ml-2">
                      from {selectedSources.size} {selectedSources.size === 1 ? 'source' : 'sources'}
                    </span>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">{error}. Showing archived news.</p>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && (
          <>
            {displayedNews.length > 0 ? (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {displayedNews.map((item, index) => (
                    <Card 
                      key={index} 
                      className="h-full hover:shadow-xl transition-all duration-300 hover:border-brand-teal/50 group cursor-pointer"
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Source Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-xs font-medium">
                            {item.source}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <time dateTime={item.date}>{getRelativeTime(item.date)}</time>
                          </div>
                        </div>

                        {/* Headline */}
                        <h3 className="text-lg font-semibold mb-3 group-hover:text-brand-teal transition-colors line-clamp-2 flex-1">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {item.headline}
                          </a>
                        </h3>

                        {/* Excerpt */}
                        {item.excerpt && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                            {item.excerpt}
                          </p>
                        )}

                        {/* Read More Link */}
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-brand-teal hover:text-brand-dark-blue transition-colors group-hover:gap-3"
                          >
                            Read full article
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* View More Link */}
                {filteredNews.length > displayedNews.length && (
                  <div className="text-center mb-8">
                    <p className="text-sm text-gray-600 mb-2">
                      Showing {displayedNews.length} of {filteredNews.length} articles
                    </p>
                    <button
                      onClick={() => {
                        // Could implement "Load More" functionality here
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-brand-teal hover:text-brand-dark-blue transition-colors font-medium"
                    >
                      View all articles
                    </button>
                  </div>
                )}

                {/* External Link */}
                <div className="text-center">
                  <a
                    href="https://www.cdc.gov/news/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-dark-blue transition-colors font-medium"
                  >
                    Visit CDC News Center
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No articles found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSources(new Set(['all']));
                  }}
                  className="text-brand-teal hover:text-white transition-colors font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
