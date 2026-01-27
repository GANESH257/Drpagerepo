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

export default function AdminDashboardPage() {
  useEffect(() => {
    // Seed mock data if empty
    seedMockJoinRequests();
  }, []);

  const requests = getJoinRequests();
  const recentRequests = requests
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: AdminJoinRequest['status']) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return <Badge variant="vibrant">Pending</Badge>;
      case 'approved':
        return <Badge variant="gradient">Accepted</Badge>;
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
        <h2 className="text-3xl font-bold text-brand-dark-blue">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of membership requests, plans, and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Recent Requests */}
      <Card className="card-vibrant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Latest membership requests requiring attention
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
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
              <p className="text-muted-foreground">No membership requests yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Requests will appear here once physicians submit applications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/admin/requests#${request.id}`}
                  className="block p-4 rounded-lg border border-transparent hover:border-brand-teal/30 hover:bg-brand-teal/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-brand-dark-blue">
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
        </CardContent>
      </Card>
    </div>
  );
}
