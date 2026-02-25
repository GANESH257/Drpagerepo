'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Users, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCards } from '@/components/admin/StatsCards';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getJoinRequests } from '@/lib/api/join-requests';
import { getAdminStats } from '@/lib/api/admin-stats';
import { DoctorsJoinedPerMonthChart } from '@/components/admin/DoctorsJoinedPerMonthChart';
import { DoctorsPerDepartmentChart } from '@/components/admin/DoctorsPerDepartmentChart';
import { DoctorsPerPlanChart } from '@/components/admin/DoctorsPerPlanChart';
import { RequestStatusChart } from '@/components/admin/RequestStatusChart';
import { GrowthTrendChart } from '@/components/admin/GrowthTrendChart';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{ totalPractices: number; totalDoctors: number; pendingApprovals: number } | null>(null);
  const [requests, setRequests] = useState<AdminJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsData, requestsData] = await Promise.all([
          getAdminStats().catch(() => ({ totalPractices: 0, totalDoctors: 0, pendingApprovals: 0 })),
          getJoinRequests().catch(() => []),
        ]);
        setStats(statsData);
        setRequests(requestsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const recentRequests = requests
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);
  // Pending from same source as charts so quick card matches Request Status chart and StatsCards
  const pendingFromRequests = requests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length;

  const getStatusBadge = (status: AdminJoinRequest['status']) => (
    <StatusBadge status={status} />
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard"
        description="Overview of membership requests, plans, and statistics"
      />

      {/* Quick Access — 3 primary tiles with actions (no duplication with stats below) */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(26, 140, 122, 0.15)' }}>
              <Building2 className="h-6 w-6" style={{ color: 'var(--aip-teal)' }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Total Practices</h3>
              <p className="text-sm text-muted-foreground">Manage practices and rosters</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground" style={{ color: 'var(--aip-teal)' }}>{loading ? '—' : (stats?.totalPractices ?? 0)}</span>
            <Button asChild className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}>
              <Link href="/admin/members/practices">
                Manage Practices
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(26, 140, 122, 0.15)' }}>
              <Users className="h-6 w-6" style={{ color: 'var(--aip-teal)' }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Total Doctors</h3>
              <p className="text-sm text-muted-foreground">Edit profiles and status</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground" style={{ color: 'var(--aip-teal)' }}>{loading ? '—' : (stats?.totalDoctors ?? 0)}</span>
            <Button asChild variant="outline" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10">
              <Link href="/admin/members/doctors">
                Manage Doctors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-100">
              <FileCheck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pending Approvals</h3>
              <p className="text-sm text-muted-foreground">Membership and profile approvals</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground" style={{ color: 'var(--aip-teal)' }}>{loading ? '—' : (pendingFromRequests ?? stats?.pendingApprovals ?? 0)}</span>
            <Button asChild variant="outline" size="sm" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10">
              <Link href="/admin/approvals">
                Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <StatsCards />

      {/* Analytics */}
      <div className="space-y-4">
        <SectionHeader
          title="Analytics & Insights"
          description="Visual overview of network growth, distribution, and membership trends"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <DoctorsJoinedPerMonthChart requests={requests} />
          <GrowthTrendChart requests={requests} />
          <DoctorsPerDepartmentChart />
          <DoctorsPerPlanChart requests={requests} />
          <RequestStatusChart requests={requests} />
        </div>
      </div>

      {/* Recent Requests - glass-card */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Recent Requests</h3>
            <p className="text-sm text-muted-foreground">Latest membership requests requiring attention</p>
          </div>
          <Button asChild variant="outline" size="sm" className="border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/10 w-fit">
            <Link href="/admin/approvals">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No membership requests yet.</p>
            <p className="text-sm mt-2">Requests will appear here once physicians submit applications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                href={`/admin/approvals/${request.id}`}
                className="block p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold" style={{ color: 'var(--aip-teal)' }}>
                        {request.applicant.fullName}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{request.applicant.specialty}</span>
                      <span className="mx-2">•</span>
                      <span>{request.plan.planId}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(request.submittedAt)}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
