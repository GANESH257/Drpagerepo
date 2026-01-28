'use client';

import { EventsEditor } from '@/components/admin/EventsEditor';

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">Events</h2>
        <p className="text-muted-foreground mt-2">
          Manage future meetings and events listed on the website, including annual meetings
        </p>
      </div>

      {/* Events Editor */}
      <EventsEditor />
    </div>
  );
}
