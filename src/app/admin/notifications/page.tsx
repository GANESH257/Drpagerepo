'use client';

import { NotificationsTable } from '@/components/admin/NotificationsTable';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Notifications</h2>
        <p className="text-gray-600 mt-2">
          View all notifications system-wide. Filter by type, read status, or doctor.
        </p>
      </div>

      {/* Notifications Table */}
      <NotificationsTable />
    </div>
  );
}
