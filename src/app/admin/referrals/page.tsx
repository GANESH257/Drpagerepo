'use client';

import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { ReferralsTable } from '@/components/admin/ReferralsTable';

export default function AdminReferralsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Referrals"
        description="View all referrals system-wide. Filter by status, doctor, or practice."
      />
      <ReferralsTable />
    </div>
  );
}
