'use client';

import { RequestsTable } from '@/components/admin/RequestsTable';

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Membership Requests</h2>
        <p className="text-gray-600 mt-2">
          Review and manage physician membership applications
        </p>
      </div>

      {/* Requests Table */}
      <RequestsTable />
    </div>
  );
}
