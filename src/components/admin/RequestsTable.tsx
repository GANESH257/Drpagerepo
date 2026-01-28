'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminJoinRequest, getJoinRequests, saveJoinRequests } from '@/lib/adminStorage';
import { RequestDetailDrawer } from './RequestDetailDrawer';
import { seedMockJoinRequests, mockJoinRequests } from '@/data/mockJoinRequests';
import { Sparkles } from 'lucide-react';

type FilterStatus = 'All' | 'Pending' | 'Accepted' | 'Rejected';

// Map status to display filter
const getDisplayStatus = (status: AdminJoinRequest['status']): FilterStatus => {
  if (status === 'submitted' || status === 'under_review') return 'Pending';
  if (status === 'approved') return 'Accepted';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
};

export function RequestsTable() {
  const [requests, setRequests] = useState<AdminJoinRequest[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [selectedRequest, setSelectedRequest] = useState<AdminJoinRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = getJoinRequests();
    setRequests(allRequests);
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'All') return true;
    const displayStatus = getDisplayStatus(req.status);
    return displayStatus === filter;
  });

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

  const handleRowClick = (request: AdminJoinRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const handleGenerateSampleRequests = () => {
    // Save mock requests to localStorage
    saveJoinRequests(mockJoinRequests);
    loadRequests();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Generate Sample Requests Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateSampleRequests}
            variant="gradient"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Sample Requests
          </Button>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList>
            <TabsTrigger value="All">
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="Pending">
              Pending ({requests.filter((r) => r.status === 'submitted').length})
            </TabsTrigger>
            <TabsTrigger value="Accepted">
              Accepted ({requests.filter((r) => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="Rejected">
              Rejected ({requests.filter((r) => r.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Table */}
        {filteredRequests.length === 0 ? (
          <Card className="card-vibrant">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {requests.length === 0
                  ? 'No membership requests yet.'
                  : `No ${filter === 'All' ? '' : filter.toLowerCase()} requests.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-vibrant">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Specialty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Submitted</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Payment</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        onClick={() => handleRowClick(request)}
                        className="border-b cursor-pointer hover:bg-brand-teal/5 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{request.applicant.fullName}</td>
                        <td className="py-3 px-4">{request.applicant.specialty}</td>
                        <td className="py-3 px-4">{formatDate(request.submittedAt)}</td>
                        <td className="py-3 px-4 capitalize">{request.plan.planId}</td>
                        <td className="py-3 px-4 capitalize">{request.paymentMethod}</td>
                        <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <RequestDetailDrawer
        request={selectedRequest}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRequestUpdate={loadRequests}
      />
    </>
  );
}
