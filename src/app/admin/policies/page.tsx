'use client';

import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { PoliciesEditor } from '@/components/admin/PoliciesEditor';

export default function AdminPoliciesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Policies"
        description="Manage organization policies and documentation"
      />
      <PoliciesEditor />
    </div>
  );
}
