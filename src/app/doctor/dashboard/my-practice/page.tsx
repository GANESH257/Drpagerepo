'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPractice } from '@/lib/api/practices';
import { getToken } from '@/lib/api/config';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Globe, Building2, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function MyPracticePage() {
  const router = useRouter();
  const { doctor } = useDoctorContext();
  const [practice, setPractice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const practiceId = (doctor as any)?.practice_id ?? doctor?.practiceId;

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
      .catch(() => setPractice(null))
      .finally(() => setLoading(false));
  }, [practiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal" />
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No practice associated with your profile.</p>
        <Button onClick={() => router.push('/doctor/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="View Practice Profile"
        description={`Read-only view of ${practice.name}`}
      />
      <div className="flex gap-2">
        <Link href="/doctor/dashboard/my-practice/locations">
          <Button variant="outline">View Practice Locations</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-brand-teal" />
            <CardTitle className="text-2xl">{practice.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {practice.description && (
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Description</h3>
              <p className="text-gray-800">{practice.description}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {practice.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-1">Phone</h3>
                  <p className="text-gray-800">{practice.phone}</p>
                </div>
              </div>
            )}
            {practice.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-1">Email</h3>
                  <p className="text-gray-800">{practice.email}</p>
                </div>
              </div>
            )}
            {practice.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-1">Website</h3>
                  <a href={practice.website} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">
                    {practice.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {practice.specialties?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Specialties</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {practice.specialties.map((s: string) => (
                <span key={s} className="px-2 py-1 rounded bg-gray-100 text-sm">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {practice.insurance?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Accepted Insurance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {practice.insurance.map((ins: any) => (
                <div key={ins.name || ins.slug}>{ins.name}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Practice Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This practice has {practice.doctors?.length || 0} doctor(s) registered. Contact your Practice Admin to view or manage the roster.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
