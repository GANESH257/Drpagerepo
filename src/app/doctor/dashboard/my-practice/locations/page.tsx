'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPractice } from '@/lib/api/practices';
import { getToken } from '@/lib/api/config';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { MapPin, Phone, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function getPracticeId(doctor: any): string | null {
  const fromDoctor = (doctor as any)?.practice_id ?? doctor?.practiceId;
  if (fromDoctor) return fromDoctor;
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('aip_doctor_user');
    if (user) {
      const parsed = JSON.parse(user) as { practiceId?: string };
      return parsed.practiceId ?? null;
    }
  } catch {
    // ignore
  }
  return null;
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

export default function MyPracticeLocationsPage() {
  const router = useRouter();
  const { doctor } = useDoctorContext();
  const [locations, setLocations] = useState<any[]>([]);
  const [practiceName, setPracticeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const practiceId = getPracticeId(doctor);

  useEffect(() => {
    if (!practiceId) {
      setLoading(false);
      return;
    }
    const token = getToken();
    getPractice(practiceId, token)
      .then((p) => {
        setPracticeName(p.name || '');
        const locs = Array.isArray(p.locations) ? p.locations : [];
        setLocations(locs.map((loc: any) => ({
          ...loc,
          address: formatAddress(loc),
        })));
      })
      .catch((err) => {
        setLoadError(err?.message || 'Failed to load practice locations');
        setLocations([]);
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

  return (
    <div className="space-y-5 relative z-10 max-w-4xl">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Practice Locations</h1>
        <p className="mt-0.5 text-xs text-gray-600">
          All office locations associated with your practice.
        </p>
      </header>

      <div className="flex justify-end">
        <Link href="/doctor/dashboard/my-practice">
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50">
            Back to Practice Profile
          </Button>
        </Link>
      </div>

      {loadError ? (
        <div className="glass-card rounded-2xl py-12 text-center space-y-3">
          <p className="text-sm text-red-600">{loadError}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLoading(true);
              setLoadError(null);
              const pid = getPracticeId(doctor);
              if (!pid) { setLoading(false); return; }
              const token = getToken();
              getPractice(pid, token)
                .then((p) => {
                  setPracticeName(p.name || '');
                  const locs = Array.isArray(p.locations) ? p.locations : [];
                  setLocations(locs.map((loc: any) => ({ ...loc, address: formatAddress(loc) })));
                })
                .catch((err) => setLoadError(err?.message || 'Failed to load'))
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </Button>
        </div>
      ) : locations.length === 0 ? (
        <div className="glass-card rounded-2xl py-12 text-center">
          <p className="text-sm text-gray-600">No locations on file for this practice.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {locations.map((loc, index) => (
            <div key={loc.id || index} className="glass-card rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-gray-900">
                    {loc.name || 'Office'}
                  </h2>
                  {index === 0 && (
                    <span className="shrink-0 rounded-lg bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-medium">
                      Primary Location
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  {loc.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">{loc.address}</p>
                    </div>
                  )}
                  {loc.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">{loc.phone}</p>
                    </div>
                  )}
                  {loc.hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">{loc.hours}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
