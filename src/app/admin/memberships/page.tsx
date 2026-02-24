'use client';

import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { PlansEditor } from '@/components/admin/PlansEditor';

export default function AdminMembershipsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Membership Plans"
        description="Edit membership plans, pricing, and features"
      />
      <PlansEditor />
    </div>
  );
}
