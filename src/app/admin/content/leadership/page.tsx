'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F5FA8]" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Leadership & Committees</h2>
        <Card><CardContent className="pt-6"><p className="text-red-600">{error}</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Leadership & Committees</h2>
        <p className="text-gray-600 mt-1">Manage the public-facing leadership directory (committees and members).</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-600">
            {committees.length} committee{committees.length !== 1 ? 's' : ''} loaded. Full CRUD UI for committees and members will be implemented here (API-only).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
