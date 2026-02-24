'use client';

import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { EventsEditor } from '@/components/admin/EventsEditor';

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Events"
        description="Manage future meetings and events listed on the website, including annual meetings"
      />
      <EventsEditor />
    </div>
  );
}
