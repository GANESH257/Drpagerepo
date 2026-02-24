'use client';

import { useEffect, useState } from 'react';
import { getBoardOfDirectors } from '@/lib/api/leadership';
import { getCommittees } from '@/lib/api/committees';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Committee } from '@/lib/api/committees';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';
import { FileText, Users, Shield, ExternalLink } from 'lucide-react';

interface BoardData {
  introText: string;
  bylawsUrl: string;
  directors: { fullName: string; role: string }[];
}

export default function LeadershipCommitteesPage() {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getBoardOfDirectors(), getCommittees()])
      .then(([boardRes, committeesList]) => {
        if (cancelled) return;
        setBoard({
          introText: boardRes.introText,
          bylawsUrl: boardRes.bylawsUrl || '/policies/governance-bylaws.pdf',
          directors: boardRes.directors || [],
        });
        setCommittees(Array.isArray(committeesList) ? committeesList : []);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load leadership');
          setBoard(null);
          setCommittees([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--aip-teal)] border-t-transparent" />
          <p className="text-sm text-gray-600">Loading leadership...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10">
      <SectionHeader
        title="Leadership & Committees"
        description="Board of Directors and official committees"
      />

      {error && (
        <Card className="glass-card border-amber-200 bg-amber-50/50">
          <CardContent className="py-4">
            <p className="text-sm text-amber-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Board of Directors - API-driven */}
      {board && (
        <Card className="glass-card overflow-hidden border-[var(--aip-teal)]/20 bg-gradient-to-b from-slate-50/80 to-white">
          <CardHeader className="border-b border-slate-200/80 bg-white/60 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--aip-teal)]/10">
                  <Shield className="h-6 w-6" style={{ color: 'var(--aip-teal)' }} />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Board of Directors
                  </CardTitle>
                  <p className="text-sm text-gray-500">Licensed medical doctors</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="shrink-0 rounded-lg"
                style={{ borderColor: 'rgba(26,140,122,0.3)', color: 'var(--aip-teal)' }}
              >
                <a
                  href={board.bylawsUrl.startsWith('http') ? board.bylawsUrl : board.bylawsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Bylaws
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {board.introText && (
              <p className="max-w-3xl text-sm leading-relaxed text-gray-700">
                {board.introText}
              </p>
            )}
            {board.directors.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {board.directors.map((d, i) => (
                  <li
                    key={`${d.fullName}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white px-4 py-3 shadow-sm"
                  >
                    <span className="font-medium text-gray-900">{d.fullName}</span>
                    <span className="rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: 'rgba(26,140,122,0.1)', color: 'var(--aip-teal)' }}>
                      {d.role}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No directors listed.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bylaws link block - prominent and trustworthy */}
      {board?.bylawsUrl && (
        <Card className="glass-card border-[var(--aip-teal)]/15 bg-[var(--aip-teal)]/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8" style={{ color: 'var(--aip-teal)' }} />
              <div>
                <p className="font-semibold text-gray-900">Governance Bylaws</p>
                <p className="text-sm text-gray-600">
                  Review the complete bylaws document governing the Alliance.
                </p>
              </div>
            </div>
            <Button asChild className="text-white rounded-lg" style={{ background: 'var(--aip-teal)' }}>
              <a
                href={board.bylawsUrl.startsWith('http') ? board.bylawsUrl : board.bylawsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Bylaws (PDF)
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Other Committees - API-driven */}
      {committees.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Committees</h2>
          </div>
          <div className="space-y-4">
            {committees.map((c) => (
              <Card key={c.id} className="glass-card border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  {c.description && (
                    <p className="text-sm font-normal text-gray-600">{c.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(c.members || []).map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
                      >
                        <div>
                          <Link
                            href={getDoctorProfileUrl({
                              slug: m.doctor_slug ?? undefined,
                              id: m.doctor_id,
                            })}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--aip-teal)' }}
                          >
                            {m.full_name}
                          </Link>
                          {m.role && (
                            <span className="ml-2 text-sm text-gray-600">— {m.role}</span>
                          )}
                          {m.specialty && (
                            <span className="block text-xs text-gray-500">{m.specialty}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!board?.directors?.length && !committees.length && !error && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-4 h-14 w-14 text-gray-300" />
            <p className="font-medium text-gray-600">No leadership data available</p>
            <p className="mt-1 text-sm text-gray-500">
              Board and committee information will appear here when published.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
