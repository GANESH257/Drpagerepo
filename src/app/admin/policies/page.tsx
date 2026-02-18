'use client';

import { PoliciesEditor } from '@/components/admin/PoliciesEditor';

export default function AdminPoliciesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Policies</h2>
        <p className="text-gray-600 mt-2">
          Manage organization policies and documentation
        </p>
      </div>

      {/* Policies Editor */}
      <PoliciesEditor />
    </div>
  );
}
