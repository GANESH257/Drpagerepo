'use client';

import { Users, Crown, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJoinRequests } from '@/lib/adminStorage';
import { doctors } from '@/data/doctors';
import { membershipPlans } from '@/data/membershipPlans';

export function StatsCards() {
  const requests = getJoinRequests();
  const acceptedRequests = requests.filter((r) => r.status === 'approved');
  const pendingRequests = requests.filter((r) => r.status === 'submitted' || r.status === 'under_review');
  
  const totalDoctors = doctors.length + acceptedRequests.length;
  
  // Calculate doctors per plan (simplified - assume accepted requests are distributed)
  const planDistribution = {
    basic: acceptedRequests.filter((r) => r.plan.planId === 'basic').length,
    professional: acceptedRequests.filter((r) => r.plan.planId === 'professional').length,
    premier: acceptedRequests.filter((r) => r.plan.planId === 'premier').length,
  };

  const stats = [
    {
      title: 'Total Doctors',
      value: totalDoctors.toString(),
      description: `${doctors.length} existing + ${acceptedRequests.length} accepted`,
      icon: Users,
      color: 'text-brand-teal',
    },
    {
      title: 'Doctors per Plan',
      value: `${planDistribution.basic + planDistribution.professional + planDistribution.premier}`,
      description: `Basic: ${planDistribution.basic}, Pro: ${planDistribution.professional}, Premier: ${planDistribution.premier}`,
      icon: Crown,
      color: 'text-brand-dark-blue',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length.toString(),
      description: 'Awaiting review',
      icon: FileText,
      color: 'text-accent-amber',
    },
    {
      title: 'Active Plans',
      value: membershipPlans.length.toString(),
      description: 'Membership tiers available',
      icon: CheckCircle2,
      color: 'text-accent-emerald',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-vibrant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
