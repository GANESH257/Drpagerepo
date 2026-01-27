import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { preventionTopics } from '@/data/preventionWellness';
import { ExploreTopicCard } from './ExploreTopicCard';

export function PreventionWellnessSection() {
  return (
    <section id="prevention" className="py-16 md:py-24 relative bg-teal-50 overflow-visible" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46, 196, 182, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26, 75, 127, 0.03) 0%, transparent 50%)' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            Prevention & Wellness
          </h2>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Prevention is the cornerstone of good health. By taking proactive steps to maintain your wellness, you can reduce your risk of many chronic diseases and improve your quality of life. Regular check-ups, healthy lifestyle choices, and staying informed about your health are essential components of preventive care.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more-info">
              <AccordionTrigger className="text-brand-dark-blue hover:text-brand-teal">
                Show more about prevention and wellness
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Preventive care encompasses a wide range of activities and choices that help you stay healthy. This includes getting recommended screenings and vaccinations, maintaining a healthy diet and weight, staying physically active, managing stress, getting adequate sleep, and avoiding harmful behaviors like smoking. Many health conditions can be prevented or better managed when detected early through regular preventive care visits with your healthcare provider. By investing in prevention today, you're investing in your long-term health and well-being.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-brand-dark-blue">
            Explore Topics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preventionTopics.map((topic) => (
              <ExploreTopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
