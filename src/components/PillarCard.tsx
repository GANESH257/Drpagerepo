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
  const bgColor = index % 2 === 0 ? 'bg-brand-teal' : 'bg-brand-dark-blue';
  const textColor = 'text-white';
  const displayedResources = pillar.resources.slice(0, 3);
  const hiddenResources = pillar.resources.slice(3);

  return (
    <Card
      className={`${bgColor} ${textColor} border-2 border-transparent`}
      style={{
        boxShadow: index % 2 === 0 
          ? '0 8px 25px rgba(29, 212, 196, 0.3), 0 4px 12px rgba(15, 95, 168, 0.2)'
          : '0 8px 25px rgba(15, 95, 168, 0.3), 0 4px 12px rgba(29, 212, 196, 0.2)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = index % 2 === 0
          ? '0 12px 35px rgba(29, 212, 196, 0.4), 0 6px 18px rgba(15, 95, 168, 0.3)'
          : '0 12px 35px rgba(15, 95, 168, 0.4), 0 6px 18px rgba(29, 212, 196, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = index % 2 === 0 
          ? '0 8px 25px rgba(29, 212, 196, 0.3), 0 4px 12px rgba(15, 95, 168, 0.2)'
          : '0 8px 25px rgba(15, 95, 168, 0.3), 0 4px 12px rgba(29, 212, 196, 0.2)';
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">{pillar.title}</CardTitle>
        </div>
        <CardDescription className="text-white/90 text-base leading-relaxed">
          {pillar.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white/90">Resources & Guides</h4>
          <div className="space-y-3">
            {displayedResources.map((resource) => (
              <div key={resource.id} className="bg-white/10 rounded-lg p-3">
                <div className="text-white">
                  <h5 className="font-semibold mb-1 text-sm">{resource.title}</h5>
                  <p className="text-xs text-white/80 mb-3">{resource.description}</p>
                  {resource.type === 'external' ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-medium text-white hover:text-white/80 underline"
                    >
                      Open Resource →
                    </a>
                  ) : (
                    <a
                      href={resource.url}
                      download
                      className="inline-flex items-center text-xs font-medium text-white hover:text-white/80 underline"
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
            <AccordionItem value="more-resources" className="border-white/20">
              <AccordionTrigger className="text-white/90 hover:text-white text-sm">
                View more resources ({hiddenResources.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {hiddenResources.map((resource) => (
                    <div key={resource.id} className="bg-white/10 rounded-lg p-3">
                      <div className="text-white">
                        <h5 className="font-semibold mb-1 text-sm">{resource.title}</h5>
                        <p className="text-xs text-white/80 mb-3">{resource.description}</p>
                        {resource.type === 'external' ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-medium text-white hover:text-white/80 underline"
                          >
                            Open Resource →
                          </a>
                        ) : (
                          <a
                            href={resource.url}
                            download
                            className="inline-flex items-center text-xs font-medium text-white hover:text-white/80 underline"
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
