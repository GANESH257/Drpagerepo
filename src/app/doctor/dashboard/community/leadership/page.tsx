'use client';

import { useEffect, useState } from 'react';
import { getBoardOfDirectors } from '@/lib/api/leadership';
import { getCommittees } from '@/lib/api/committees';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Committee } from '@/lib/api/committees';
import { useProfileView } from '@/contexts/ProfileViewContext';
import { FileText, Users, Shield, ExternalLink } from 'lucide-react';
import { boardOfDirectorsFallback } from '@/data/boardOfDirectorsFallback';

interface BoardData {
  introText: string;
  bylawsUrl: string;
  directors: { fullName: string; role: string; photo?: string }[];
}

export default function LeadershipCommitteesPage() {
  const { openProfile } = useProfileView();
  const [board, setBoard] = useState<BoardData | null>(null);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getBoardOfDirectors(), getCommittees()])
      .then(([boardRes, committeesList]) => {
        if (cancelled) return;
        const directors = Array.isArray(boardRes.directors) && boardRes.directors.length > 0
          ? boardRes.directors
          : boardOfDirectorsFallback.directors;
        setBoard({
          introText: boardRes.introText || boardOfDirectorsFallback.introText,
          bylawsUrl: boardRes.bylawsUrl || boardOfDirectorsFallback.bylawsUrl,
          directors,
        });
        setCommittees(Array.isArray(committeesList) ? committeesList : []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setBoard({
            introText: boardOfDirectorsFallback.introText,
            bylawsUrl: boardOfDirectorsFallback.bylawsUrl,
            directors: boardOfDirectorsFallback.directors,
          });
          setCommittees([]);
          setError(null);
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
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading leadership...</p>
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
        <Card className="glass-card border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardContent className="py-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Board of Directors - API-driven */}
      {board && (
        <Card className="glass-card overflow-hidden border-[var(--aip-teal)]/20 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-800/90 dark:to-slate-900 dark:border-slate-700">
          <CardHeader className="border-b border-slate-200/80 bg-white/60 dark:border-slate-700 dark:bg-slate-800/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--aip-teal)]/10 dark:bg-[var(--aip-teal)]/20">
                <Shield className="h-6 w-6" style={{ color: 'var(--aip-teal)' }} />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Board of Directors
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">Licensed medical doctors</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {board.introText && (
              <p className="max-w-3xl text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {board.introText}
              </p>
            )}
            {board.directors.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {board.directors.map((d, i) => (
                  <li
                    key={`${d.fullName}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800/70 px-4 py-3 shadow-sm"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">{d.fullName}</span>
                    <span className="rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: 'rgba(26,140,122,0.1)', color: 'var(--aip-teal)' }}>
                      {d.role}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No directors listed.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bylaws link block - prominent and trustworthy */}
      {board?.bylawsUrl && (
        <Card className="glass-card border-[var(--aip-teal)]/15 bg-[var(--aip-teal)]/5 dark:border-[var(--aip-teal)]/30 dark:bg-[var(--aip-teal)]/15">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8" style={{ color: 'var(--aip-teal)' }} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Governance Bylaws</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review the complete bylaws document governing the Alliance.
                </p>
              </div>
            </div>
            <Button asChild className="text-white rounded-lg dark:bg-[var(--aip-teal)] dark:hover:opacity-90" style={{ background: 'var(--aip-teal)' }}>
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
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Committees</h2>
          </div>
          <div className="space-y-4">
            {committees.map((c) => (
              <Card key={c.id} className="glass-card border-gray-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-base dark:text-gray-100">{c.name}</CardTitle>
                  {c.description && (
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{c.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(c.members || []).map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 py-2 last:border-0"
                      >
                        <div>
                          <button
                            type="button"
                            onClick={() => openProfile({ slug: m.doctor_slug ?? undefined, id: m.doctor_id })}
                            className="font-medium hover:underline text-left"
                            style={{ color: 'var(--aip-teal)' }}
                          >
                            {m.full_name}
                          </button>
                          {m.role && (
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">— {m.role}</span>
                          )}
                          {m.specialty && (
                            <span className="block text-xs text-gray-500 dark:text-gray-500">{m.specialty}</span>
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
            <Users className="mb-4 h-14 w-14 text-gray-300 dark:text-gray-600" />
            <p className="font-medium text-gray-600 dark:text-gray-400">No leadership data available</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              Board and committee information will appear here when published.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
