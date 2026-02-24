'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPractice } from '@/lib/api/practices';
import { getToken } from '@/lib/api/config';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

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

export default function MyPracticeLocationsPage() {
  const router = useRouter();
  const { doctor } = useDoctorContext();
  const [locations, setLocations] = useState<any[]>([]);
  const [practiceName, setPracticeName] = useState('');
  const [loading, setLoading] = useState(true);

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
          address: loc.address ?? loc.address_line1 ?? [loc.address_line1, loc.city, loc.state, loc.zip].filter(Boolean).join(', '),
        })));
      })
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, [practiceId]);

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
        title="View Practice Locations"
        description={practiceName ? `Office locations for ${practiceName}` : 'Office locations for your practice'}
      />
      <Link href="/doctor/dashboard/my-practice">
        <Button variant="outline">Back to Practice Profile</Button>
      </Link>
      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            No locations on file for this practice.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-teal mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold">{loc.name || 'Office'}</h3>
                  <p className="text-sm text-gray-600">{loc.address}</p>
                  {(loc.city || loc.state || loc.zip) && (
                    <p className="text-sm text-gray-500">
                      {loc.city}{loc.city && loc.state ? ', ' : ''}{loc.state} {loc.zip}
                    </p>
                  )}
                  {loc.phone && <p className="text-sm mt-1">Phone: {loc.phone}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
