'use client';

import { useEffect, useState } from 'react';
import { getCommittees } from '@/lib/api/committees';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Committee } from '@/lib/api/committees';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';

export default function LeadershipCommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommittees()
      .then((list) => setCommittees(Array.isArray(list) ? list : []))
      .catch(() => setCommittees([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leadership & Committees"
        description="Board of Directors and official committees"
      />
      {committees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No committees listed yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {committees.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
                {c.description && (
                  <p className="text-sm text-gray-600 font-normal">{c.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(c.members || []).map((m) => (
                    <li key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <Link href={getDoctorProfileUrl({ slug: m.doctor_slug ?? undefined, id: m.doctor_id })} className="font-medium text-brand-teal hover:underline">
                          {m.full_name}
                        </Link>
                        {m.role && <span className="text-gray-600 text-sm ml-2">— {m.role}</span>}
                        {m.specialty && <span className="text-gray-500 text-sm block">{m.specialty}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
