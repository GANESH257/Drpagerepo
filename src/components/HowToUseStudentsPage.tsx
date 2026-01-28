import {
  GraduationCap,
  FileText,
  BookOpen,
  Calendar,
  Newspaper,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: GraduationCap,
    step: '1',
    title: 'Choose Your Current Stage',
    description: 'Select whether you\'re in pre-med, preparing for USMLE exams, or transitioning to residency to find relevant resources.',
  },
  {
    icon: FileText,
    step: '2',
    title: 'Download Curated Guides',
    description: 'Access comprehensive guides, checklists, and templates tailored to your specific needs and stage of training.',
  },
  {
    icon: BookOpen,
    step: '3',
    title: 'Learn from Physicians',
    description: 'Read articles and insights written by experienced physicians who share their knowledge and practical advice.',
  },
  {
    icon: Calendar,
    step: '4',
    title: 'Track Deadlines & Timelines',
    description: 'Use our tools to manage exam dates, application deadlines, financial planning, and important milestones.',
  },
  {
    icon: Newspaper,
    step: '5',
    title: 'Stay Up to Date',
    description: 'Keep informed with the latest medical student news, policy changes, and opportunities in medical education.',
  },
];

export function HowToUseStudentsPage() {
  return (
    <section id="how-to-use" className="py-16 md:py-24 relative bg-teal-50 overflow-visible" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(46, 196, 182, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26, 75, 127, 0.03) 0%, transparent 50%)' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark-blue">
            How to Use This Page
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Follow these simple steps to make the most of our medical student resources
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.step}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-brand-teal" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-brand-dark-blue">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
