'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCards } from '@/components/admin/StatsCards';
import { getJoinRequests, AdminJoinRequest } from '@/lib/adminStorage';
import { seedMockJoinRequests } from '@/data/mockJoinRequests';
import { DoctorsJoinedPerMonthChart } from '@/components/admin/DoctorsJoinedPerMonthChart';
import { DoctorsPerDepartmentChart } from '@/components/admin/DoctorsPerDepartmentChart';
import { DoctorsPerPlanChart } from '@/components/admin/DoctorsPerPlanChart';
import { RequestStatusChart } from '@/components/admin/RequestStatusChart';
import { GrowthTrendChart } from '@/components/admin/GrowthTrendChart';

export default function AdminDashboardPage() {
  useEffect(() => {
    // Seed mock data if empty
    seedMockJoinRequests();
  }, []);

  // Get requests - this will be reactive since getJoinRequests reads from localStorage
  const requests = getJoinRequests();
  const recentRequests = requests
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: AdminJoinRequest['status']) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-[#0F5FA8] text-white border-[#0F5FA8]">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Overview of membership requests, plans, and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Analytics Charts */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-[#0F5FA8] mb-2">Analytics & Insights</h3>
          <p className="text-sm text-gray-600">
            Visual overview of network growth, distribution, and membership trends
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <DoctorsJoinedPerMonthChart requests={requests} />
          <GrowthTrendChart requests={requests} />
          <DoctorsPerDepartmentChart />
          <DoctorsPerPlanChart requests={requests} />
          <RequestStatusChart requests={requests} />
        </div>
      </div>

      {/* Recent Requests */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#0F5FA8]">Recent Requests</CardTitle>
              <CardDescription className="text-gray-600">
                Latest membership requests requiring attention
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="border-[#0F5FA8] text-[#0F5FA8] hover:bg-[#0F5FA8] hover:text-white">
              <Link href="/admin/requests">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No membership requests yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Requests will appear here once physicians submit applications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/admin/requests#${request.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-[#0F5FA8]/30 hover:bg-[#0F5FA8]/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-[#0F5FA8]">
                          {request.applicant.fullName}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>{request.applicant.specialty}</span>
                        <span className="mx-2">•</span>
                        <span>{request.plan.planId}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(request.submittedAt)}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
