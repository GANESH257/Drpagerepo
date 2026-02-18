'use client';

import { EventsEditor } from '@/components/admin/EventsEditor';

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Events</h2>
        <p className="text-gray-600 mt-2">
          Manage future meetings and events listed on the website, including annual meetings
        </p>
      </div>

      {/* Events Editor */}
      <EventsEditor />
    </div>
  );
}
