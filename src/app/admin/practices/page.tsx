'use client';

import { PracticesTable } from '@/components/admin/PracticesTable';

export default function AdminPracticesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Practice Management</h2>
        <p className="text-gray-600 mt-2">
          Manage practices, locations, insurance, services, and doctor rosters. Changes apply immediately (admin override).
        </p>
      </div>

      {/* Practices Table */}
      <PracticesTable />
    </div>
  );
}
