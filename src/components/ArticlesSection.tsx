'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticleCard } from './ArticleCard';
import { studentArticles } from '@/data/medStudentArticles';

type Category = 'all' | 'study-exams' | 'wellness' | 'research' | 'residency' | 'finance';

const categoryLabels: Record<Category, string> = {
  'all': 'All',
  'study-exams': 'Study & Exams',
  'wellness': 'Wellness',
  'research': 'Research',
  'residency': 'Residency',
  'finance': 'Finance',
};

export function ArticlesSection() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const filteredArticles = selectedCategory === 'all'
    ? studentArticles
    : studentArticles.filter(article => article.category === selectedCategory);

  return (
    <section id="articles" className="py-16 md:py-24 relative bg-white overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Helpful Articles by Doctors
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Curated articles written by experienced physicians sharing insights and practical advice for medical students
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 h-auto p-1">
            {(Object.keys(categoryLabels) as Category[]).map((category) => (
              <TabsTrigger 
                key={category} 
                value={category} 
                className="text-xs md:text-sm min-h-[40px] h-[40px] flex items-center justify-center whitespace-nowrap px-2 py-2.5"
              >
                {categoryLabels[category]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No articles found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
