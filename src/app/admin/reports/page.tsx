'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Reporting & Analytics</h2>
        <p className="text-gray-600 mt-1">Platform growth, member distribution by specialty, and KPIs.</p>
      </div>
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
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
