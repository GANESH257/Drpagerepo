'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MembershipBenefit } from '@/types';
import * as LucideIcons from 'lucide-react';
import { useMemo } from 'react';

interface BenefitCardProps {
  benefit: MembershipBenefit;
}

export function BenefitCard({ benefit }: BenefitCardProps) {
  // Dynamically get icon component from Lucide
  const IconComponent = useMemo(() => {
    const IconName = benefit.icon as keyof typeof LucideIcons;
    return LucideIcons[IconName] as React.ComponentType<{ className?: string }> || LucideIcons.HelpCircle;
  }, [benefit.icon]);

  return (
    <Card className="h-full card-vibrant">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal mb-2">
            <IconComponent className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-brand-dark-blue">
            {benefit.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {benefit.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
