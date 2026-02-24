'use client';

import { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
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

  const handleRowClick = (request: AdminJoinRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {error && (
          <div className="glass-card p-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
          <TabsList className="inline-flex h-9 rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="All" className="rounded-md px-4 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-br data-[state=active]:from-[var(--aip-teal)] data-[state=active]:to-[var(--aip-navy)]">
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="Pending" className="rounded-md px-4 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-br data-[state=active]:from-[var(--aip-teal)] data-[state=active]:to-[var(--aip-navy)]">
              Pending ({requests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length})
            </TabsTrigger>
            <TabsTrigger value="Accepted" className="rounded-md px-4 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-br data-[state=active]:from-[var(--aip-teal)] data-[state=active]:to-[var(--aip-navy)]">
              Accepted ({requests.filter((r) => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="Rejected" className="rounded-md px-4 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-gradient-to-br data-[state=active]:from-[var(--aip-teal)] data-[state=active]:to-[var(--aip-navy)]">
              Rejected ({requests.filter((r) => r.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="glass-card flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
                {requests.length === 0
                  ? 'No membership requests yet.'
                  : `No ${filter === 'All' ? '' : filter.toLowerCase()} requests.`}
              </p>
          </div>
        ) : (
          <div className="glass-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specialty</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => handleRowClick(request)}
                      className="border-b border-border cursor-pointer hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-foreground">{request.applicant.fullName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{request.applicant.specialty}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(request.submittedAt)}</td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">{request.plan.planId}</td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">{request.paymentMethod}</td>
                      <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
