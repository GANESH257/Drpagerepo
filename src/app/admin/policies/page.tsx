'use client';

import { PoliciesEditor } from '@/components/admin/PoliciesEditor';

export default function AdminPoliciesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">Policies</h2>
        <p className="text-muted-foreground mt-2">
          Manage organization policies and documentation
        </p>
      </div>

      {/* Policies Editor */}
      <PoliciesEditor />
    </div>
  );
}
