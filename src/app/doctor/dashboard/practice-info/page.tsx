'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Practice } from '@/types/practice';
import { getActorFromSession } from '@/lib/services/permissionService';
import { AuthRequiredError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPractice } from '@/lib/api/practices';
import { MapPin, Phone, Mail, Globe, Building2, Users, Shield } from 'lucide-react';
import { useDoctorContext } from '@/components/dashboard/DoctorContext';

export default function PracticeInfoPage() {
  const router = useRouter();
  const { doctor } = useDoctorContext();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPractice() {
      try {
        const actor = getActorFromSession();
        if (actor.kind !== 'doctor') {
          router.push('/join-us');
          return;
        }
        // API returns snake_case (practice_id); frontend type uses practiceId
        const practiceId = (doctor as any)?.practice_id ?? doctor?.practiceId ?? actor.practiceId;
        if (!practiceId) {
          setPractice(null);
          setIsLoading(false);
          return;
        }
        const raw = await getPractice(practiceId);
        const r = raw as any;
        // Normalize API shape: backend uses flat address_line1, city, state, zip; may use created_at/updated_at
        const foundPractice: Practice = {
          ...raw,
          slug: r.slug ?? r.id ?? '',
          description: r.description ?? '',
          phone: r.phone ?? '',
          createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
          updatedAt: r.updated_at ?? r.updatedAt ?? new Date().toISOString(),
          address: raw.address ?? {
            line1: r.address_line1 ?? '',
            line2: r.address_line2,
            city: r.city ?? '',
            state: r.state ?? '',
            zip: r.zip ?? '',
            country: r.country ?? 'USA',
          },
          locations: Array.isArray(raw.locations) ? raw.locations : [],
          specialties: Array.isArray(raw.specialties) ? raw.specialties : [],
          doctorIds: Array.isArray(r.doctors) ? r.doctors.map((d: { id: string }) => d.id) : [],
        };
        setPractice(foundPractice);
      } catch (error) {
        if (error instanceof AuthRequiredError) {
          router.push('/join-us');
          return;
        }
        setPractice(null);
      }
      setIsLoading(false);
    }
    loadPractice();
  }, [router, doctor]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice information...</p>
        </div>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Practice not found</p>
        <Button onClick={() => router.push('/doctor/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Practice Information"
        description={`View details for ${practice.name}`}
      />

      {/* Practice Overview */}
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

          {/* Contact Information */}
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
                  <a 
                    href={practice.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-teal hover:underline"
                  >
                    {practice.website}
                  </a>
                </div>
              </div>
            )}
            {practice.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-1">Address</h3>
                  <p className="text-gray-800">
                    {practice.address.line1 && `${practice.address.line1}, `}
                    {practice.address.city}, {practice.address.state} {practice.address.zip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      {practice.locations && practice.locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Practice Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {practice.locations.map((location) => (
                <div key={location.id} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{location.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {location.address && <p>{location.address}</p>}
                    <p>
                      {location.city}, {location.state} {location.zip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specialties */}
      {practice.specialties && practice.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {practice.specialties.map((specialty) => (
                <Badge key={specialty} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services */}
      {practice.services && practice.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {practice.services.map((service, idx) => (
                <li key={idx}>{service}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Insurance */}
      {practice.insurance && practice.insurance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Accepted Insurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {practice.insurance.map((ins) => (
                <div key={ins.name} className="text-sm">
                  <span className="font-medium">{ins.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Practice Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This practice has {practice.doctorIds?.length || 0} doctor{practice.doctorIds?.length !== 1 ? 's' : ''} registered.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Contact your Practice Admin to view the full roster or make changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
