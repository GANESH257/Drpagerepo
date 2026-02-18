'use client';

import { PlansEditor } from '@/components/admin/PlansEditor';

export default function AdminMembershipsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Membership Plans</h2>
        <p className="text-gray-600 mt-2">
          Edit membership plans, pricing, and features
        </p>
      </div>

      {/* Plans Editor */}
      <PlansEditor />
    </div>
  );
}
