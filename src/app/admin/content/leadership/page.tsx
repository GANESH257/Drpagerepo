'use client';

import { useEffect, useState } from 'react';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { getCommittees } from '@/lib/api/committees';

export default function AdminContentLeadershipPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [committees, setCommittees] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const list = await getCommittees();
        setCommittees(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load committees');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--aip-teal)' }} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Leadership & Committees" description="Manage the public-facing leadership directory." />
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leadership & Committees"
        description="Manage the public-facing leadership directory (committees and members)."
      />
      <div className="glass-card p-6">
        <p className="text-muted-foreground">
          {committees.length} committee{committees.length !== 1 ? 's' : ''} loaded. Full CRUD UI for committees and members will be implemented here (API-only).
        </p>
      </div>
    </div>
  );
}
