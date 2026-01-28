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
    <section id="prevention" className="py-16 md:py-24 relative bg-gradient-to-br from-brand-dark-blue/90 via-brand-dark-blue-alt/80 to-brand-dark-blue/95 overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Prevention & Wellness
          </h2>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-lg text-white/90 mb-4 leading-relaxed">
            Prevention is the cornerstone of good health. By taking proactive steps to maintain your wellness, you can reduce your risk of many chronic diseases and improve your quality of life. Regular check-ups, healthy lifestyle choices, and staying informed about your health are essential components of preventive care.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more-info" className="border-white/20">
              <AccordionTrigger className="text-white/90 hover:text-white text-sm py-2 px-3 bg-white/5 rounded-md">
                Show more about prevention and wellness
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <p className="text-sm text-white/80 leading-relaxed">
                  Preventive care encompasses a wide range of activities and choices that help you stay healthy. This includes getting recommended screenings and vaccinations, maintaining a healthy diet and weight, staying physically active, managing stress, getting adequate sleep, and avoiding harmful behaviors like smoking. Many health conditions can be prevented or better managed when detected early through regular preventive care visits with your healthcare provider. By investing in prevention today, you're investing in your long-term health and well-being.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-white">
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
