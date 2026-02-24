'use client';

import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { NotificationsTable } from '@/components/admin/NotificationsTable';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        description="View all notifications system-wide. Filter by type, read status, or doctor."
      />
      <NotificationsTable />
    </div>
  );
}
