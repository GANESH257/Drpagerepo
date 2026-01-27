'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Calendar } from 'lucide-react';
import { trusteeBoardMembers } from '@/data/trusteeBoardMembers';
import { trusteePolicies } from '@/data/trusteePolicies';
import { nextMeeting } from '@/data/boardMeetings';

export function GovernanceMetrics() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const metrics = [
    {
      icon: Users,
      label: 'Board Members',
      value: trusteeBoardMembers.length.toString(),
      color: 'text-brand-teal',
      bgColor: 'bg-brand-teal/10',
    },
    {
      icon: FileText,
      label: 'Policies Published',
      value: trusteePolicies.length.toString(),
      color: 'text-brand-dark-blue',
      bgColor: 'bg-brand-dark-blue/10',
    },
    {
      icon: Calendar,
      label: 'Next Meeting',
      value: formatDate(nextMeeting.date),
      color: 'text-brand-teal',
      bgColor: 'bg-brand-teal/10',
    },
  ];

  return (
    <section className="py-12 md:py-16 relative skin-paper border-y-2 border-brand-teal/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="card-vibrant">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${metric.bgColor} mb-4`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <div className={`text-3xl font-bold ${metric.color} mb-2`}>
                      {metric.value}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      {metric.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
