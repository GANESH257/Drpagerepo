'use client';

import { PlansEditor } from '@/components/admin/PlansEditor';

export default function AdminMembershipsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">Membership Plans</h2>
        <p className="text-muted-foreground mt-2">
          Edit membership plans, pricing, and features
        </p>
      </div>

      {/* Plans Editor */}
      <PlansEditor />
    </div>
  );
}
