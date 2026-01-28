'use client';

import { RequestsTable } from '@/components/admin/RequestsTable';

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">Membership Requests</h2>
        <p className="text-muted-foreground mt-2">
          Review and manage physician membership applications
        </p>
      </div>

      {/* Requests Table */}
      <RequestsTable />
    </div>
  );
}
