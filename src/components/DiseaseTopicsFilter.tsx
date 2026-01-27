'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DISEASE_TOPICS } from '@/data/publicHealthArticles';

const topicLabels: Record<string, string> = {
  'all': 'All',
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

interface DiseaseTopicsFilterProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export function DiseaseTopicsFilter({ selectedTopic, onTopicChange }: DiseaseTopicsFilterProps) {
  return (
    <section id="disease-topics" className="py-16 md:py-24 relative bg-white overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Browse Health Topics
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Explore articles and resources organized by health condition and topic
          </p>
        </div>

        <Tabs value={selectedTopic} onValueChange={onTopicChange} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 mb-8 p-1 bg-gray-100">
            {DISEASE_TOPICS.map((topic) => (
              <TabsTrigger
                key={topic}
                value={topic}
                className="text-xs md:text-sm px-3 md:px-4 py-2.5 h-[40px] min-w-[80px] flex items-center justify-center whitespace-nowrap data-[state=active]:bg-brand-teal data-[state=active]:text-white"
                aria-selected={selectedTopic === topic}
              >
                {topicLabels[topic] || topic}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedTopic} className="mt-0">
            {/* Content will be handled by parent component */}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
