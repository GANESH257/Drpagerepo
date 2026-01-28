'use client';

import * as React from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  DollarSign,
  FileText,
  Briefcase,
  LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { StudentPillar } from '@/types';

interface PillarCardProps {
  pillar: StudentPillar;
  index: number;
}

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  Award,
  DollarSign,
  FileText,
  Briefcase,
};

export function PillarCard({ pillar, index }: PillarCardProps) {
  const Icon = iconMap[pillar.icon] || FileText;
  const displayedResources = pillar.resources.slice(0, 3);
  const hiddenResources = pillar.resources.slice(3);

  return (
    <Card
      className="bg-white border border-gray-200 hover:border-brand-teal/30 transition-all duration-300 hover:shadow-lg group"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)';
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-brand-teal/10 group-hover:bg-brand-teal/20 flex items-center justify-center transition-colors">
            <Icon className="h-6 w-6 text-brand-dark-blue group-hover:text-brand-teal transition-colors" />
          </div>
          <CardTitle className="text-2xl text-brand-dark-blue group-hover:text-brand-teal transition-colors">{pillar.title}</CardTitle>
        </div>
        <CardDescription className="text-gray-600 text-base leading-relaxed">
          {pillar.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-700">Resources & Guides</h4>
          <div className="space-y-3">
            {displayedResources.map((resource) => (
              <div key={resource.id} className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 border border-gray-100 transition-colors">
                <div>
                  <h5 className="font-semibold mb-1 text-sm text-brand-dark-blue">{resource.title}</h5>
                  <p className="text-xs text-gray-600 mb-3">{resource.description}</p>
                  {resource.type === 'external' ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-medium text-brand-teal hover:text-brand-dark-blue underline transition-colors"
                    >
                      Open Resource →
                    </a>
                  ) : (
                    <a
                      href={resource.url}
                      download
                      className="inline-flex items-center text-xs font-medium text-brand-teal hover:text-brand-dark-blue underline transition-colors"
                    >
                      Download Guide →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {hiddenResources.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more-resources" className="border-gray-200">
              <AccordionTrigger className="text-gray-700 hover:text-brand-dark-blue text-sm">
                View more resources ({hiddenResources.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {hiddenResources.map((resource) => (
                    <div key={resource.id} className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 border border-gray-100 transition-colors">
                      <div>
                        <h5 className="font-semibold mb-1 text-sm text-brand-dark-blue">{resource.title}</h5>
                        <p className="text-xs text-gray-600 mb-3">{resource.description}</p>
                        {resource.type === 'external' ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-medium text-brand-teal hover:text-brand-dark-blue underline transition-colors"
                          >
                            Open Resource →
                          </a>
                        ) : (
                          <a
                            href={resource.url}
                            download
                            className="inline-flex items-center text-xs font-medium text-brand-teal hover:text-brand-dark-blue underline transition-colors"
                          >
                            Download Guide →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
