'use client';

import { useEffect, useState } from 'react';
import { Crown, CheckCircle2 } from 'lucide-react';
import { getJoinRequests } from '@/lib/api/join-requests';
import { getDoctors } from '@/lib/api/doctors';
import { getMembershipPlans } from '@/lib/api/membership-plans';
import { getToken } from '@/lib/api/config';
import { getDoctorsPerPlan } from '@/lib/adminAnalytics';

export function StatsCards() {
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [totalDoctorsFromApi, setTotalDoctorsFromApi] = useState(0);
  const [planDistribution, setPlanDistribution] = useState<{ basic: number; professional: number; premier: number }>({ basic: 0, professional: 0, premier: 0 });
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const token = getToken();
        const [requestsData, doctorsRes, plansData, planData] = await Promise.all([
          getJoinRequests().catch(() => []),
          token ? getDoctors({ limit: 1 }, token).catch(() => ({ doctors: [], pagination: { total: 0 } })) : Promise.resolve({ doctors: [], pagination: { total: 0 } }),
          getMembershipPlans().catch(() => []),
          getDoctorsPerPlan([]).catch(() => []),
        ]);
        setJoinRequests(requestsData);
        setTotalDoctorsFromApi(doctorsRes.pagination?.total ?? 0);
        setMembershipPlans(plansData);
        const basic = planData.find((p) => p.plan === 'Basic')?.count ?? 0;
        const professional = planData.find((p) => p.plan === 'Professional')?.count ?? 0;
        const premier = planData.find((p) => p.plan === 'Premier')?.count ?? 0;
        setPlanDistribution({ basic, professional, premier });
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

  const planSum = planDistribution.basic + planDistribution.professional + planDistribution.premier;

  // Only non-duplicate stats: Doctors per Plan and Active Plans (Total Doctors and Pending are in the 3 button cards above)
  const stats = [
    {
      title: 'Doctors per Plan',
      value: planSum.toString(),
      description: `Basic: ${planDistribution.basic}, Pro: ${planDistribution.professional}, Premier: ${planDistribution.premier}`,
      icon: Crown,
      color: 'text-[var(--aip-teal)]',
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
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">Loading...</span>
            </div>
            <div className="text-xl font-bold mt-2" style={{ color: 'var(--aip-teal)' }}>-</div>
            <p className="text-xs text-muted-foreground mt-1">Loading data...</p>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card p-6 col-span-2">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="glass-card p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <Icon className="h-4 w-4 text-[var(--aip-teal)]" />
            </div>
            <div className="text-xl font-bold mt-2" style={{ color: 'var(--aip-teal)' }}>{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
