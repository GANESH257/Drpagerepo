'use client';

import { useEffect, useState } from 'react';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { getCommittees } from '@/lib/api/committees';
import { boardOfDirectorsFallback } from '@/data/boardOfDirectorsFallback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leadership & Committees"
        description="Manage the public-facing leadership directory (committees and members)."
      />
      {error && (
        <div className="glass-card p-6">
          <p className="text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Showing stored board data below.</p>
        </div>
      )}

      {/* Stored Board of Directors (used when API is unavailable or in doctor portal fallback) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Board of Directors (stored)</CardTitle>
          <p className="text-sm text-muted-foreground">
            This list is shown on the doctor portal when the API is unavailable. It matches the bylaws seed data.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {boardOfDirectorsFallback.directors.map((d, i) => (
              <li key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium">{d.fullName}</span>
                <span className="text-sm rounded-md px-2.5 py-1 bg-muted text-muted-foreground">{d.role}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Committees from API */}
      <div className="glass-card p-6">
        <p className="text-muted-foreground">
          {committees.length} committee{committees.length !== 1 ? 's' : ''} loaded from API. Full CRUD UI for committees and members will be implemented here (API-only).
        </p>
      </div>
    </div>
  );
}
