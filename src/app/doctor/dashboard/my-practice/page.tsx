'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPractice } from '@/lib/api/practices';
import { getToken } from '@/lib/api/config';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { Phone, Mail, Globe, Users, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function practiceInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  return (name || 'P').charAt(0).toUpperCase();
}

function formatAddress(loc: any): string {
  const parts: string[] = [];
  const line1 = loc.address ?? loc.address_line1;
  if (line1) parts.push(line1);
  if (loc.address_line2) parts.push(loc.address_line2);
  if (loc.city || loc.state || loc.zip) {
    parts.push([loc.city, loc.state, loc.zip].filter(Boolean).join(', '));
  }
  return parts.join(', ');
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
        <p className="text-sm text-muted-foreground">
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

  const locations = practice.locations || [];
  const doctors = practice.doctors || [];
  const specializationLine = practice.specialties?.length
    ? practice.specialties.join(' · ')
    : practice.description
      ? null
      : null;

  return (
    <div className="space-y-6 relative z-10 max-w-4xl">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-foreground">My Practice</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your practice details, contact info, locations, and physicians
        </p>
      </header>

      {/* Generic Details */}
      <section className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Generic Details</h2>
          <div className="flex gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}
            >
              {practiceInitials(practice.name)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground">{practice.name}</h3>
              {specializationLine && (
                <p className="text-sm text-muted-foreground mt-0.5">{specializationLine}</p>
              )}
              {practice.description && (
                <p className="text-sm text-muted-foreground mt-2">{practice.description}</p>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Active Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practice.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{practice.phone}</span>
              </div>
            )}
            {practice.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${practice.email}`} className="text-sm text-[var(--aip-teal)] hover:underline">
                  {practice.email}
                </a>
              </div>
            )}
            {!practice.phone && !practice.email && (
              <p className="text-sm text-muted-foreground">No contact info on file.</p>
            )}
          </div>
        </div>

        {/* Practice Website */}
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Practice Website</h2>
          {practice.website ? (
            <a
              href={practice.website.startsWith('http') ? practice.website : `https://${practice.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: 'var(--aip-teal)' }}
            >
              <Globe className="h-4 w-4" />
              {practice.website.replace(/^https?:\/\//i, '')}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No website on file.</p>
          )}
        </div>

        {/* Location list */}
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location list
          </h2>
          {locations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No locations on file for this practice.</p>
          ) : (
            <ul className="space-y-4">
              {locations.map((loc: any, index: number) => {
                const address = formatAddress(loc);
                return (
                  <li key={loc.id || index} className="rounded-lg border border-border bg-card p-4">
                    <p className="font-medium text-foreground text-sm">
                      {loc.name || 'Office'}
                      {index === 0 && (
                        <span className="ml-2 text-xs font-normal text-emerald-700 dark:text-emerald-400">Primary</span>
                      )}
                    </p>
                    {address && <p className="text-sm text-muted-foreground mt-1">{address}</p>}
                    {loc.phone && <p className="text-sm text-muted-foreground mt-0.5">{loc.phone}</p>}
                    {loc.hours && <p className="text-xs text-muted-foreground mt-0.5">{loc.hours}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Doctor List */}
        <div className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Doctor list
          </h2>
          {doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No physicians listed for this practice.</p>
          ) : (
            <ul className="space-y-2">
              {doctors.map((d: any) => (
                <li key={d.id} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="font-medium">{d.fullName ?? d.full_name ?? '—'}</span>
                  {d.specialty && <span className="text-muted-foreground">· {d.specialty}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
