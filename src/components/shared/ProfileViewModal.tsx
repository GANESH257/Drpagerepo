'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';
import type { Location } from '@/types';
import { getDoctor, getDoctorBySlug } from '@/lib/api/doctors';
import { getPractice } from '@/lib/api/practices';
import { getPracticeById } from '@/lib/services/practiceDirectoryService';
import { getInstitutionById } from '@/lib/institutionStorage';
import { getContactCard } from '@/lib/services/visibilityService';
import { getActorFromSession } from '@/lib/services/permissionService';
import { getUploadFullUrl } from '@/lib/api/upload';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';
import { getToken } from '@/lib/api/config';
import {
  CheckCircle2,
  MapPin,
  Phone,
  ExternalLink,
  GraduationCap,
  Building2,
  Award,
  Briefcase,
  Clock,
  Building,
  Mail,
  Loader2,
} from 'lucide-react';

export type ProfileViewInput =
  | { id: string }
  | { slug: string }
  | { doctor: Doctor };

interface ProfileViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Identify which profile to load. If doctor is passed, we still refetch to get full data unless skipRefetch is true. */
  input: ProfileViewInput | null;
  /** When true and input is { doctor }, skip API refetch and use passed doctor (e.g. when data is already loaded). */
  skipRefetch?: boolean;
}

function mapApiLocationToLocation(loc: any): Location {
  const address = loc.address ?? [loc.address_line1, loc.address_line2].filter(Boolean).join(', ').trim() ?? '';
  const city = loc.city ?? '';
  const state = loc.state ?? '';
  const zip = loc.zip ?? '';
  const addressString = [address, city, state, zip].filter(Boolean).join(', ');
  const directionsUrl = addressString
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`
    : undefined;
  return {
    name: loc.name ?? 'Office',
    address,
    city,
    state,
    zip,
    phone: loc.phone ?? '',
    directionsUrl,
    hours: loc.hours,
  };
}

export function ProfileViewModal({
  open,
  onOpenChange,
  input,
  skipRefetch = false,
}: ProfileViewModalProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [practice, setPractice] = useState<any>(null);
  const [contactCard, setContactCard] = useState<any>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!input || !open) return;

    setError(null);
    setDoctor(null);
    setPractice(null);
    setContactCard(null);
    setLocations([]);

    const preloaded = 'doctor' in input ? input.doctor : null;
    if (preloaded && skipRefetch) {
      setDoctor(preloaded);
      if (preloaded.practiceId) {
        try {
          const p = await getPractice(preloaded.practiceId, getToken()).catch(() => getPracticeById(preloaded.practiceId!));
          if (p) {
            setPractice(p);
            const actor = getActorFromSession();
            const card = getContactCard(actor, preloaded, p);
            setContactCard(card);
            const rawLocs = Array.isArray(p.locations) ? p.locations : [];
            setLocations(rawLocs.map(mapApiLocationToLocation));
          }
        } catch (_) {}
      }
      return;
    }

    setLoading(true);
    try {
      let d: Doctor;
      if (preloaded && !skipRefetch) {
        d = preloaded.slug
          ? await getDoctorBySlug(preloaded.slug, getToken())
          : await getDoctor(preloaded.id, getToken());
      } else if ('slug' in input && input.slug) {
        d = await getDoctorBySlug(input.slug, getToken());
      } else if ('id' in input && input.id) {
        d = await getDoctor(input.id, getToken());
      } else {
        setError('Missing profile identifier');
        setLoading(false);
        return;
      }

      setDoctor(d);

      if (d.practiceId) {
        try {
          const p = await getPractice(d.practiceId, getToken()).catch(() => getPracticeById(d.practiceId!));
          if (p) {
            const normalized = {
              ...p,
              address: p.address ?? {
                line1: (p as any).address_line1 ?? '',
                line2: (p as any).address_line2,
                city: (p as any).city ?? '',
                state: (p as any).state ?? '',
                zip: (p as any).zip ?? '',
                country: (p as any).country ?? 'USA',
              },
            };
            setPractice(normalized);
            const actor = getActorFromSession();
            setContactCard(getContactCard(actor, d, normalized));
            const rawLocs = Array.isArray(p.locations) ? p.locations : [];
            setLocations(rawLocs.map(mapApiLocationToLocation));
          }
        } catch (_) {
          try {
            const fallback = await getPracticeById(d.practiceId);
            if (fallback) {
              setPractice(fallback);
              const actor = getActorFromSession();
              setContactCard(getContactCard(actor, d, fallback));
              const rawLocs = fallback?.locations && Array.isArray(fallback.locations) ? fallback.locations : [];
              setLocations(rawLocs.map((loc: any) => mapApiLocationToLocation(loc)));
            }
          } catch (_) {}
        }
      } else if (d.institutionId) {
        const inst = getInstitutionById(d.institutionId);
        if (inst) {
          const practiceLike = {
            id: inst.id,
            name: inst.name,
            address: inst.address,
            phone: inst.phone,
            email: inst.email,
            website: inst.website,
            description: inst.description || '',
          };
          setPractice(practiceLike);
          const actor = getActorFromSession();
          setContactCard(getContactCard(actor, d, practiceLike));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [input, open, skipRefetch]);

  useEffect(() => {
    if (open && input) loadProfile();
  }, [open, input, loadProfile]);

  const displayLocations: Location[] =
    doctor?.locations?.length ? doctor.locations : locations;
  const rawImage = doctor?.image?.trim();
  const profileImageUrl = rawImage
    ? (rawImage.startsWith('http') ? rawImage : getUploadFullUrl(rawImage))
    : undefined;
  const initial = (doctor?.fullName?.charAt(0) || doctor?.firstName?.charAt(0) || '?').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden border-border bg-background text-foreground dark:border-slate-700 dark:bg-slate-900"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 border-b border-border dark:border-slate-700 px-6 py-4 bg-muted/30 dark:bg-slate-800/50">
          <DialogTitle className="text-xl font-semibold text-foreground dark:text-gray-100 pr-8">
            Physician Profile
          </DialogTitle>
        </DialogHeader>

        <div id="profile-view-modal-body" className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--aip-teal)]" />
              <p className="text-sm text-muted-foreground dark:text-gray-400">Loading profile...</p>
            </div>
          )}

          {error && !loading && (
            <div className="py-8 text-center">
              <p className="text-destructive dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          )}

          {doctor && !loading && (
            <>
              {/* Hero row: image + name + specialty + verified + actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-muted dark:bg-slate-800 flex items-center justify-center">
                    {profileImageUrl && !imageError ? (
                      <Image
                        src={profileImageUrl}
                        alt={doctor.fullName}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-4xl font-bold text-[var(--aip-teal)] dark:text-[var(--aip-teal)]">
                        {initial}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-foreground dark:text-gray-100 truncate">
                      {doctor.fullName}
                    </h2>
                    {doctor.verified && (
                      <Badge className="bg-[var(--aip-teal)]/10 text-[var(--aip-teal)] border border-[var(--aip-teal)]/20 dark:bg-[var(--aip-teal)]/20 dark:text-teal-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    {doctor.specialty}
                  </p>
                  {doctor.credentials && (
                    <p className="text-sm text-muted-foreground dark:text-gray-500 mt-0.5">
                      {doctor.credentials}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild className="border-[var(--aip-teal)]/50 text-[var(--aip-teal)] dark:border-[var(--aip-teal)]/50 dark:text-[var(--aip-teal)]">
                      <a
                        href={getDoctorProfileUrl(doctor)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Open full profile
                      </a>
                    </Button>
                    {doctor.bookingUrl && (
                      <Button size="sm" asChild className="bg-[var(--aip-teal)] text-white hover:opacity-90">
                        <a href={doctor.bookingUrl} target="_blank" rel="noopener noreferrer">
                          Book Directly
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* About */}
              {(doctor.about || doctor.bio) && (
                <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base text-foreground dark:text-gray-100">About</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {doctor.about || doctor.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Practice */}
              {practice && (
                <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground dark:text-gray-100">
                      <Building className="h-4 w-4 text-[var(--aip-teal)]" />
                      Practice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <h3 className="font-semibold text-foreground dark:text-gray-100">{practice.name}</h3>
                    <div className="text-sm text-muted-foreground dark:text-gray-400 space-y-1">
                      {practice.address?.line1 && <p>{practice.address.line1}</p>}
                      {practice.address && (
                        <p>
                          {practice.address.city}, {practice.address.state} {practice.address.zip}
                        </p>
                      )}
                      {contactCard?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${contactCard.phone}`} className="hover:text-[var(--aip-teal)]">
                            {contactCard.phone}
                          </a>
                        </div>
                      )}
                      {contactCard?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${contactCard.email}`} className="hover:text-[var(--aip-teal)]">
                            {contactCard.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Professional Credentials */}
              {(doctor.medicalSchool || doctor.residency || doctor.internship || (doctor.boardCertifications && doctor.boardCertifications.length > 0) || (doctor.statesLicensedIn && doctor.statesLicensedIn.length > 0)) && (
                <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base text-foreground dark:text-gray-100">Professional Credentials</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctor.medicalSchool && (
                      <div className="flex gap-2">
                        <GraduationCap className="h-4 w-4 text-[var(--aip-teal)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground dark:text-gray-500">Medical School</p>
                          <p className="text-sm text-foreground dark:text-gray-300">{doctor.medicalSchool}</p>
                        </div>
                      </div>
                    )}
                    {doctor.residency && (
                      <div className="flex gap-2">
                        <Building2 className="h-4 w-4 text-[var(--aip-teal)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground dark:text-gray-500">Residency</p>
                          <p className="text-sm text-foreground dark:text-gray-300">{doctor.residency}</p>
                        </div>
                      </div>
                    )}
                    {doctor.boardCertifications && doctor.boardCertifications.length > 0 && (
                      <div className="flex gap-2 sm:col-span-2">
                        <Award className="h-4 w-4 text-[var(--aip-teal)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground dark:text-gray-500 mb-1">Board Certifications</p>
                          <div className="flex flex-wrap gap-1">
                            {doctor.boardCertifications.map((c, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {typeof c === 'string' ? c : c.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {doctor.statesLicensedIn && doctor.statesLicensedIn.length > 0 && (
                      <div className="flex gap-2 sm:col-span-2">
                        <MapPin className="h-4 w-4 text-[var(--aip-teal)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground dark:text-gray-500 mb-1">States Licensed In</p>
                          <div className="flex flex-wrap gap-1">
                            {doctor.statesLicensedIn.map((s, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Specialties */}
              {((doctor.specialties && doctor.specialties.length > 0) || doctor.specialty) && (
                <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base text-foreground dark:text-gray-100">Specialties</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {(doctor.specialties?.length ? doctor.specialties : [doctor.specialty]).filter(Boolean).map((s, i) => (
                        <Badge key={i} variant="secondary" className="bg-[var(--aip-teal)]/10 text-[var(--aip-teal)] dark:bg-[var(--aip-teal)]/20 dark:text-teal-300">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Conditions & Treatments / Services */}
              {((doctor.conditionServices && doctor.conditionServices.length > 0) || (doctor.conditionsAndServices && doctor.conditionsAndServices.length > 0)) && (
                <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base text-foreground dark:text-gray-100">Conditions & Treatments</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {doctor.conditionServices && doctor.conditionServices.some((r) => r.condition || (r.services && r.services.length > 0)) ? (
                      <div className="rounded-md border border-border dark:border-slate-600 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 dark:bg-slate-700/50 border-b border-border dark:border-slate-600">
                              <th className="text-left font-medium p-2 w-[40%] text-foreground dark:text-gray-200">Condition</th>
                              <th className="text-left font-medium p-2 text-foreground dark:text-gray-200">Treatments / Services</th>
                            </tr>
                          </thead>
                          <tbody>
                            {doctor.conditionServices.map((row, i) => (
                              <tr key={i} className="border-b border-border dark:border-slate-700 last:border-b-0">
                                <td className="p-2 text-muted-foreground dark:text-gray-400">{row.condition || '—'}</td>
                                <td className="p-2 text-muted-foreground dark:text-gray-400">
                                  {row.services && row.services.length > 0 ? row.services.filter(Boolean).join(', ') : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {(doctor.conditionsAndServices || []).map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground dark:text-gray-400">
                            <span className="text-[var(--aip-teal)] mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Locations */}
              {displayLocations.length > 0 && (
                <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base text-foreground dark:text-gray-100">Locations</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {displayLocations.map((loc, i) => (
                      <div key={i} className="border-l-2 border-[var(--aip-teal)]/30 pl-3 py-1">
                        <p className="font-medium text-sm text-foreground dark:text-gray-100">{loc.name}</p>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          {loc.address}<br />
                          {loc.city}, {loc.state} {loc.zip}
                        </p>
                        {loc.directionsUrl && (
                          <a
                            href={loc.directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--aip-teal)] hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            <MapPin className="h-3 w-3" /> Directions
                          </a>
                        )}
                        {loc.hours && (
                          <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                            <Clock className="h-3 w-3 inline mr-1" /> {loc.hours}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Insurance */}
              {doctor.insurance && doctor.insurance.length > 0 && (
                <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base text-foreground dark:text-gray-100">Accepted Insurance</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {doctor.insurance.map((ins) => (
                        <Badge key={ins.slug || ins.name} variant="outline" className="text-xs">
                          {ins.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info */}
              <Card className="border-border dark:border-slate-700 dark:bg-slate-800/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-base text-foreground dark:text-gray-100">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground dark:text-gray-500">Accepts New Patients</span>
                    <span className="ml-2 text-foreground dark:text-gray-300">{doctor.acceptsNewPatients ? 'Yes' : 'No'}</span>
                  </div>
                  {doctor.npi && (
                    <div>
                      <span className="font-medium text-muted-foreground dark:text-gray-500">NPI</span>
                      <span className="ml-2 text-foreground dark:text-gray-300">{doctor.npi}</span>
                    </div>
                  )}
                  {doctor.website && (
                    <div>
                      <a
                        href={doctor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--aip-teal)] hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Personal website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
