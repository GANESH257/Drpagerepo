'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPractice } from '@/lib/api/practices';
import { getToken } from '@/lib/api/config';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Globe, Users } from 'lucide-react';
import Link from 'next/link';

function practiceInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return (name || 'P').charAt(0).toUpperCase();
}

export default function MyPracticePage() {
  const router = useRouter();
  const { doctor } = useDoctorContext();
  const [practice, setPractice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const practiceId =
    (doctor as any)?.practice_id ??
    doctor?.practiceId ??
    (typeof window !== 'undefined'
      ? (() => {
          try {
            const u = localStorage.getItem('aip_doctor_user');
            if (u) return (JSON.parse(u) as { practiceId?: string }).practiceId ?? null;
          } catch {
            // ignore
          }
          return null;
        })()
      : null);

  useEffect(() => {
    if (!practiceId) {
      setLoading(false);
      return;
    }
    const token = getToken();
    getPractice(practiceId, token)
      .then((raw) => {
        const r = raw as any;
        setPractice({
          ...raw,
          locations: Array.isArray(raw.locations) ? raw.locations : [],
          specialties: Array.isArray(raw.specialties) ? raw.specialties : [],
          services: Array.isArray(raw.services) ? raw.services : [],
          insurance: Array.isArray(raw.insurance) ? raw.insurance : [],
          doctors: Array.isArray(r.doctors) ? r.doctors : [],
        });
      })
      .catch((err) => {
        setLoadError(err?.message || 'Failed to load practice profile');
        setPractice(null);
      })
      .finally(() => setLoading(false));
  }, [practiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--aip-teal)]" />
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-gray-600">
          {loadError ? loadError : 'No practice associated with your profile.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          {loadError && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                const token = getToken();
                getPractice(practiceId!, token)
                  .then((raw) => {
                    const r = raw as any;
                    setPractice({
                      ...raw,
                      locations: Array.isArray(raw.locations) ? raw.locations : [],
                      specialties: Array.isArray(raw.specialties) ? raw.specialties : [],
                      services: Array.isArray(raw.services) ? raw.services : [],
                      insurance: Array.isArray(raw.insurance) ? raw.insurance : [],
                      doctors: Array.isArray(r.doctors) ? r.doctors : [],
                    });
                  })
                  .catch((err) => setLoadError(err?.message || 'Failed to load'))
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </Button>
          )}
          <Button onClick={() => router.push('/doctor/dashboard')} size="sm" variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const specializationLine = practice.specialties?.length
    ? practice.specialties.join(' · ')
    : practice.description
      ? null
      : null;
  const memberCount = practice.doctors?.length ?? 0;

  return (
    <div className="space-y-5 relative z-10 max-w-4xl">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Practice Profile</h1>
        <p className="mt-0.5 text-xs text-gray-600">
          View your practice&apos;s information on the AIP network
        </p>
      </header>

      <div className="flex justify-end">
        <Link href="/doctor/dashboard/my-practice/locations">
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs border-[var(--aip-teal)] text-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/5">
            View Practice Locations
          </Button>
        </Link>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        {/* Top: identity */}
        <div className="p-5">
          <div className="flex gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
            >
              {practiceInitials(practice.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{practice.name}</h2>
              {specializationLine && (
                <p className="text-sm text-gray-600 mt-0.5">{specializationLine}</p>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
                <span className="text-xs font-semibold text-emerald-700">Active Member</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Bottom: contact & details in two columns */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {practice.phone && (
              <div>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{practice.phone}</p>
              </div>
            )}
            {practice.email && (
              <div>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{practice.email}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {practice.website && (
              <div>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </p>
                <a
                  href={practice.website.startsWith('http') ? practice.website : `https://${practice.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium mt-0.5 block hover:underline"
                  style={{ color: 'var(--aip-teal)' }}
                >
                  {practice.website.replace(/^https?:\/\//i, '')}
                </a>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Physicians
              </p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
