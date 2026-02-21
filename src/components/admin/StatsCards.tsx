'use client';

import { useEffect, useState } from 'react';
import { Users, Crown, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJoinRequests } from '@/lib/api/join-requests';
import { getAllDoctors } from '@/lib/memberStorage';
import { getMembershipPlans } from '@/lib/api/membership-plans';

export function StatsCards() {
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [requestsData, doctorsData, plansData] = await Promise.all([
          getJoinRequests().catch(() => []),
          getAllDoctors().catch(() => []),
          getMembershipPlans().catch(() => []),
        ]);
        setJoinRequests(requestsData);
        setDoctors(doctorsData);
        setMembershipPlans(plansData);
        setError(null);
      } catch (err) {
        console.error('Error loading stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const acceptedRequests = joinRequests.filter((r) => r.status === 'approved');
  const pendingRequests = joinRequests.filter((r) => r.status === 'submitted' || r.status === 'under_review');
  
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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F5FA8]">-</div>
              <p className="text-xs text-gray-500 mt-1">Loading data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-red-200 rounded-xl shadow-sm col-span-4">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color === 'text-brand-teal' ? 'text-[#0F5FA8]' : stat.color === 'text-accent-amber' ? 'text-amber-600' : stat.color === 'text-accent-emerald' ? 'text-emerald-600' : 'text-[#0F5FA8]'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F5FA8]">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
