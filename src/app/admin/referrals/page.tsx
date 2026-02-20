'use client';

import { ReferralsTable } from '@/components/admin/ReferralsTable';

export default function AdminReferralsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Referrals</h2>
        <p className="text-gray-600 mt-2">
          View all referrals system-wide. Filter by status, doctor, or practice.
        </p>
      </div>

      {/* Referrals Table */}
      <ReferralsTable />
    </div>
  );
}
