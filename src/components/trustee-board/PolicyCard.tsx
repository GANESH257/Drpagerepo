'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { TrusteePolicy } from '@/types';

interface PolicyCardProps {
  policy: TrusteePolicy;
}

export function PolicyCard({ policy }: PolicyCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Governance':
        return 'bg-brand-teal text-white';
      case 'Compliance':
        return 'bg-brand-dark-blue text-white';
      case 'Operations':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="h-full card-vibrant">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{policy.title}</CardTitle>
            <Badge variant={policy.category === 'Governance' ? 'gradient' : 'vibrant'}>
              {policy.category}
            </Badge>
          </div>
          <div className="p-2 rounded-lg bg-brand-teal/10">
            <FileText className="h-5 w-5 text-brand-teal" />
          </div>
        </div>
        <CardDescription className="text-base leading-relaxed">
          {policy.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {policy.fileSize && (
            <p className="text-sm text-gray-500">{policy.fileSize}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
            asChild
          >
            <a href={policy.filePath} download>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
