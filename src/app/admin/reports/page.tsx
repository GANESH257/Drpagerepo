'use client';

import { useEffect, useState } from 'react';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { getJoinRequests } from '@/lib/api/join-requests';
import { DoctorsJoinedPerMonthChart } from '@/components/admin/DoctorsJoinedPerMonthChart';
import { DoctorsPerDepartmentChart } from '@/components/admin/DoctorsPerDepartmentChart';
import { DoctorsPerPlanChart } from '@/components/admin/DoctorsPerPlanChart';
import { RequestStatusChart } from '@/components/admin/RequestStatusChart';
import { GrowthTrendChart } from '@/components/admin/GrowthTrendChart';

export default function AdminReportsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJoinRequests()
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reporting & Analytics"
        description="Platform growth, member distribution by specialty, and KPIs."
      />
      {error && (
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <DoctorsJoinedPerMonthChart requests={requests} />
        <GrowthTrendChart requests={requests} />
        <DoctorsPerDepartmentChart />
        <DoctorsPerPlanChart requests={requests} />
        <RequestStatusChart requests={requests} />
      </div>
    </div>
  );
}
