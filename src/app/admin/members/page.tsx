'use client';

import { MembersTable } from '@/components/admin/MembersTable';

export default function AdminMembersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">Member Management</h2>
        <p className="text-muted-foreground mt-2">
          Edit doctor profiles, manage passwords, and remove members
        </p>
      </div>

      {/* Members Table */}
      <MembersTable />
    </div>
  );
}
