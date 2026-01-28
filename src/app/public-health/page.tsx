'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicHealthHero } from '@/components/PublicHealthHero';
import { PublicHealthHelperNav } from '@/components/public-health/PublicHealthHelperNav';
import { LatestNewsSection } from '@/components/LatestNewsSection';
import { GenericCTASection } from '@/components/GenericCTASection';
import { DiseaseTopicsFilter } from '@/components/DiseaseTopicsFilter';
import { ArticleGrid } from '@/components/ArticleGrid';
import { PreventionWellnessSection } from '@/components/PreventionWellnessSection';
import { InsuranceInfoSection } from '@/components/InsuranceInfoSection';
import { PublicationsSection } from '@/components/PublicationsSection';
import { publicHealthArticles } from '@/data/publicHealthArticles';

function PublicHealthPageContent() {
  const searchParams = useSearchParams();
  const wellnessTopic = searchParams.get('wellnessTopic');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Filter articles based on selected topic
  const filteredArticles = selectedTopic === 'all'
    ? publicHealthArticles
    : publicHealthArticles.filter(article => article.topics.includes(selectedTopic));

  // If wellnessTopic query param is set, filter to show prevention-related articles
  useEffect(() => {
    if (wellnessTopic) {
      // Map wellness topics to article topics
      const wellnessTopicMap: Record<string, string[]> = {
        'preventive-care': ['nutrition', 'cancer', 'heart-disease'],
        'nutrition-diet': ['nutrition', 'obesity', 'diabetes'],
        'sleep': ['mental-health', 'depression', 'anxiety'],
        'exercise': ['heart-disease', 'obesity', 'diabetes'],
        'vaccines': ['covid-19', 'influenza', 'infectious-diseases'],
        'type-2-diabetes-prevention': ['diabetes', 'nutrition', 'obesity'],
        'hypertension-control': ['hypertension', 'heart-disease', 'nutrition'],
        'improving-public-health': ['infectious-diseases', 'nutrition', 'mental-health'],
      };
      
      const topics = wellnessTopicMap[wellnessTopic] || [];
      if (topics.length > 0) {
        // Set topic filter to first matching topic or show all prevention-related
        setSelectedTopic(topics[0]);
      }
    }
  }, [wellnessTopic]);

  return (
    <>
      <PublicHealthHero />
      <PublicHealthHelperNav />
      <LatestNewsSection />
      <GenericCTASection />
      
      {/* Disease Topics Filter + Article Grid */}
      <DiseaseTopicsFilter selectedTopic={selectedTopic} onTopicChange={setSelectedTopic} />
      <div className="container mx-auto px-4 pb-16">
        <ArticleGrid articles={filteredArticles} />
      </div>

      <PreventionWellnessSection />
      <InsuranceInfoSection />
      <PublicationsSection />
    </>
  );
}

export default function PublicHealthPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-24">
        <Suspense fallback={<div className="min-h-screen pt-24 skin-slate">Loading...</div>}>
          <PublicHealthPageContent />
        </Suspense>
      </div>
    </div>
  );
}
