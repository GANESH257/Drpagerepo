'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { getJoinRequests } from '@/lib/api/join-requests';
import { RequestDetailDrawer } from './RequestDetailDrawer';

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const allRequests = await getJoinRequests();
      setRequests(allRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
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

  const handleRowClick = (request: AdminJoinRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {error && (
          <Card className="bg-white border border-red-200 rounded-xl shadow-sm">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="All" className="data-[state=active]:bg-[#0F5FA8] data-[state=active]:text-white">
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="Pending" className="data-[state=active]:bg-[#0F5FA8] data-[state=active]:text-white">
              Pending ({requests.filter((r) => r.status === 'submitted').length})
            </TabsTrigger>
            <TabsTrigger value="Accepted" className="data-[state=active]:bg-[#0F5FA8] data-[state=active]:text-white">
              Accepted ({requests.filter((r) => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="Rejected" className="data-[state=active]:bg-[#0F5FA8] data-[state=active]:text-white">
              Rejected ({requests.filter((r) => r.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Table */}
        {loading ? (
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 mb-4">Loading requests...</p>
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 mb-4">
                {requests.length === 0
                  ? 'No membership requests yet.'
                  : `No ${filter === 'All' ? '' : filter.toLowerCase()} requests.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#0F5FA8]">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#0F5FA8]">Specialty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#0F5FA8]">Submitted</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#0F5FA8]">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#0F5FA8]">Payment</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#0F5FA8]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request, index) => (
                      <tr
                        key={request.id}
                        onClick={() => handleRowClick(request)}
                        className={`border-b border-gray-200 cursor-pointer hover:bg-[#0F5FA8]/5 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">{request.applicant.fullName}</td>
                        <td className="py-3 px-4 text-gray-700">{request.applicant.specialty}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(request.submittedAt)}</td>
                        <td className="py-3 px-4 capitalize text-gray-700">{request.plan.planId}</td>
                        <td className="py-3 px-4 capitalize text-gray-700">{request.paymentMethod}</td>
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
