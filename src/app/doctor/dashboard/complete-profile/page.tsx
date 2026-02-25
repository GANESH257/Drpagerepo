'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getDoctor } from '@/lib/api/doctors';
import { getPractice } from '@/lib/api/practices';
import { createApprovalRequest } from '@/lib/api/approval-requests';
import { CredentialItemForm } from '@/components/shared/CredentialItemForm';
import { toCertificationItems } from '@/lib/utils/credentialUtils';
import { geocodeZip } from '@/lib/services/geocodingService';
import { Doctor } from '@/types';
import { CertificationItem } from '@/types';
import { Loader2, Building2, User, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, getUser } = useDoctorSession();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [practice, setPractice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Profile form state (from doctor + edits)
  const [profile, setProfile] = useState<Partial<Doctor>>({});
  // Practice form state
  const [practiceName, setPracticeName] = useState('');
  const [practiceDescription, setPracticeDescription] = useState('');
  const [practicePhone, setPracticePhone] = useState('');
  const [practiceWebsite, setPracticeWebsite] = useState('');
  const [practiceAddress, setPracticeAddress] = useState({ line1: '', line2: '', city: '', state: '', zip: '' });
  const [locations, setLocations] = useState<Array<{ id?: string; name: string; address?: string; address_line1?: string; city?: string; state?: string; zip?: string; phone?: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const token = getToken();
      const user = getUser();
      if (!token || !user?.doctorId) {
        router.push('/join-us');
        return;
      }
      try {
        const doc = await getDoctor(user.doctorId, token);
        if (cancelled || !doc) {
          if (!doc) router.push('/join-us');
          return;
        }
        setDoctor(doc);
        // Phase 2: Pending doctors use the dashboard flow instead of this page.
        const isPending = doc.profileStatus === 'pending_profile' || doc.verified !== true;
        if (isPending) {
          router.replace('/doctor/dashboard');
          return;
        }
        setProfile({
          fullName: doc.fullName,
          bio: doc.bio || '',
          about: doc.about || '',
          phone: doc.phone || '',
          website: doc.website || '',
          medicalSchool: doc.medicalSchool || '',
          residency: doc.residency || '',
          internship: doc.internship || '',
          boardCertifications: doc.boardCertifications || [],
          hospitalPrivileges: doc.hospitalPrivileges || [],
          statesLicensedIn: doc.statesLicensedIn || [],
          npi: doc.npi || '',
          badgesAwards: doc.badgesAwards || [],
        });
        if (doc.practiceId) {
          const prac = await getPractice(doc.practiceId, token).catch(() => null);
          if (cancelled) return;
          if (prac) {
            setPractice(prac);
            setPracticeName(prac.name || '');
            setPracticeDescription(prac.description || '');
            setPracticePhone(prac.phone || '');
            setPracticeWebsite(prac.website || '');
            setPracticeAddress({
              line1: prac.address_line1 || (prac as any).address?.line1 || '',
              line2: prac.address_line2 || (prac as any).address?.line2 || '',
              city: prac.city || (prac as any).address?.city || '',
              state: prac.state || (prac as any).address?.state || '',
              zip: prac.zip || (prac as any).address?.zip || '',
            });
            const locs = Array.isArray(prac.locations) ? prac.locations : [];
            setLocations(locs.length ? locs.map((l: any) => ({ id: l.id, name: l.name || 'Location', address_line1: l.address_line1 || l.address, city: l.city, state: l.state, zip: l.zip, phone: l.phone })) : [{ name: 'Main Office', address_line1: '', city: '', state: '', zip: '' }]);
          } else {
            setPracticeName('');
            setLocations([{ name: 'Main Office', address_line1: '', city: '', state: '', zip: '' }]);
          }
        } else {
          setPracticeName('');
          setLocations([{ name: 'Main Office', address_line1: '', city: '', state: '', zip: '' }]);
        }
      } catch {
        if (!cancelled) setError('Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // Run only once on mount - getToken/getUser change every render and would reset form on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const validateProfile = () => {
    if (!profile.fullName?.trim()) return 'Full name is required';
    if (!profile.bio?.trim()) return 'Bio is required';
    if (!profile.phone?.trim()) return 'Phone is required';
    if (!profile.website?.trim()) return 'Website is required';
    if (!profile.npi?.trim()) return 'NPI is required';
    if (!/^\d{10}$/.test((profile.npi ?? '').trim())) return 'NPI must be 10 digits';
    if (!profile.medicalSchool?.trim()) return 'Medical school is required';
    return '';
  };

  const validatePractice = () => {
    if (!practiceName.trim()) return 'Practice name is required';
    if (!practicePhone?.trim()) return 'Practice phone is required';
    if (!practiceAddress.zip?.trim()) return 'ZIP is required for the primary location.';
    // At least one location with address (medical standard: practice must have at least one location with address)
    const hasValidLocation =
      locations.some(
        (loc) =>
          (loc.name?.trim() || '').length > 0 &&
          (((loc.address_line1 || loc.address || '').trim().length > 0) || ((loc.city || '').trim().length > 0 && (loc.state || '').trim().length > 0))
      ) ||
      (practiceAddress.line1?.trim().length > 0 || (practiceAddress.city?.trim().length > 0 && practiceAddress.state?.trim().length > 0));
    if (!hasValidLocation) {
      return 'At least one practice location with address is required (address line or city and state).';
    }
    return '';
  };

  const isPracticeAdmin = doctor?.roleInPractice === 'practice_admin';

  const handleSubmit = async () => {
    const profileErr = validateProfile();
    if (profileErr) {
      setError(profileErr);
      setStep(1);
      return;
    }
    if (isPracticeAdmin) {
      const practiceErr = validatePractice();
      if (practiceErr) {
        setError(practiceErr);
        setStep(2);
        return;
      }
      if (!doctor?.practiceId) {
        setError('Missing practice');
        return;
      }
    }
    if (!doctor?.id) {
      setError('Missing doctor');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Only include credential items that have at least a name; image and year are optional per item
      const withName = (item: CertificationItem) => (item?.name ?? '').trim().length > 0;
      const boardCerts = toCertificationItems(profile.boardCertifications ?? []).filter(withName);
      const badges = (profile.badgesAwards ?? []).filter(withName);

      const doctorPayload = {
        fullName: profile.fullName,
        bio: profile.bio,
        about: profile.about,
        phone: profile.phone,
        website: profile.website,
        medicalSchool: profile.medicalSchool,
        residency: profile.residency,
        internship: profile.internship,
        boardCertifications: boardCerts,
        hospitalPrivileges: profile.hospitalPrivileges ?? [],
        statesLicensedIn: profile.statesLicensedIn ?? [],
        npi: profile.npi,
        badgesAwards: badges,
      };
      if (isPracticeAdmin) {
        // Geocode primary location from ZIP so practice can show on map
        let primaryLat: number | null = null;
        let primaryLng: number | null = null;
        const zip5 = (practiceAddress.zip ?? '').trim().replace(/\D/g, '').slice(0, 5);
        if (zip5.length === 5) {
          try {
            const coords = await geocodeZip(zip5);
            primaryLat = coords.lat;
            primaryLng = coords.lng;
          } catch {
            // Continue without coords; location still saved with address
          }
        }

        // Ensure at least one location: sync main practice address into first location if needed.
        // For the first location, prefer practiceAddress (what user typed in Primary location) over
        // stale DB values (e.g. zip='00000' from join-application default).
        const locationsToSend =
          locations.length > 0
            ? locations.map((loc, i) => {
                const isFirst = i === 0;
                const locZip = loc.zip && loc.zip !== '00000' ? loc.zip : '';
                return {
                id: loc.id,
                name: loc.name || 'Main Office',
                address_line1: isFirst ? (practiceAddress.line1 || loc.address_line1 || loc.address || '') : (loc.address_line1 ?? loc.address ?? ''),
                address_line2: undefined,
                city: isFirst ? (practiceAddress.city || loc.city || '') : (loc.city ?? ''),
                state: isFirst ? (practiceAddress.state || loc.state || '') : (loc.state ?? ''),
                zip: isFirst ? (practiceAddress.zip || locZip || '') : (loc.zip ?? ''),
                phone: loc.phone,
                latitude: i === 0 ? primaryLat ?? undefined : undefined,
                longitude: i === 0 ? primaryLng ?? undefined : undefined,
              };
              })
            : [
                {
                  id: undefined,
                  name: 'Main Office',
                  address_line1: practiceAddress.line1 ?? '',
                  address_line2: undefined,
                  city: practiceAddress.city ?? '',
                  state: practiceAddress.state ?? '',
                  zip: practiceAddress.zip ?? '',
                  phone: undefined,
                  latitude: primaryLat ?? undefined,
                  longitude: primaryLng ?? undefined,
                },
              ];
        await createApprovalRequest({
          type: 'practice_admin_profile_practice_completion',
          practice_id: doctor.practiceId,
          target_doctor_id: doctor.id,
          payload: {
            doctorId: doctor.id,
            practiceId: doctor.practiceId,
            doctor: doctorPayload,
            practice: {
              name: practiceName,
              description: practiceDescription || undefined,
              phone: practicePhone || undefined,
              website: practiceWebsite || undefined,
              address: practiceAddress,
              address_line1: practiceAddress.line1,
              address_line2: practiceAddress.line2,
              city: practiceAddress.city,
              state: practiceAddress.state,
              zip: practiceAddress.zip,
            },
            locations: locationsToSend,
          },
        });
      } else {
        await createApprovalRequest({
          type: 'doctor_profile_completion',
          practice_id: doctor.practiceId ?? undefined,
          target_doctor_id: doctor.id,
          payload: { doctorId: doctor.id, doctor: doctorPayload },
        });
      }
      router.push('/doctor/dashboard/complete-profile?submitted=1');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  const submitted = searchParams.get('submitted') === '1';

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardHeader>
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-center">Submission received</CardTitle>
            <CardDescription className="text-center">
              {isPracticeAdmin
                ? 'Your profile and practice details have been sent for admin approval. You will get full dashboard access once approved.'
                : 'Your profile has been sent for admin approval. You will get full dashboard access once approved.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 doctor-portal-form">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark-blue">Complete your profile</h1>
          <p className="text-muted-foreground mt-1">
            {isPracticeAdmin
              ? 'Add your details and practice information. Admin will review and activate your listing.'
              : 'Add your professional details. Admin will review and activate your listing.'}
          </p>
        </div>

        {step === 1 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isPracticeAdmin ? 'Step 1: Profile details' : 'Profile details'}
              </CardTitle>
              <CardDescription>Fields marked with * are required. Others help patients find and learn about you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full name *</Label>
                <Input value={profile.fullName || ''} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div>
                <Label>Bio *</Label>
                <Textarea value={profile.bio || ''} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Brief professional bio" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={profile.phone || ''} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <Label>Website *</Label>
                <Input value={profile.website || ''} onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))} placeholder="https://" />
              </div>
              <div>
                <Label>NPI *</Label>
                <Input value={profile.npi || ''} onChange={(e) => setProfile((p) => ({ ...p, npi: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit NPI" maxLength={10} />
              </div>
              <div>
                <Label>Medical school *</Label>
                <Input value={profile.medicalSchool || ''} onChange={(e) => setProfile((p) => ({ ...p, medicalSchool: e.target.value }))} />
              </div>
              <div>
                <Label>Residency (optional)</Label>
                <Input value={profile.residency || ''} onChange={(e) => setProfile((p) => ({ ...p, residency: e.target.value }))} />
              </div>
              <div>
                <Label>Internship (optional)</Label>
                <Input value={profile.internship || ''} onChange={(e) => setProfile((p) => ({ ...p, internship: e.target.value }))} />
              </div>
              <CredentialItemForm
                items={toCertificationItems(profile.boardCertifications)}
                onChange={(items: CertificationItem[]) => setProfile((p) => ({ ...p, boardCertifications: items }))}
                label="Board certifications (optional; image optional per item)"
                addButtonLabel="Add certification"
              />
              <CredentialItemForm
                items={profile.badgesAwards || []}
                onChange={(items: CertificationItem[]) => setProfile((p) => ({ ...p, badgesAwards: items }))}
                label="Badges & awards (optional; image optional per item)"
                addButtonLabel="Add badge or award"
              />
              {isPracticeAdmin ? (
                <Button onClick={() => setStep(2)} className="w-full">
                  Next: Practice details
                </Button>
              ) : (
                <>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button variant="portal-primary" onClick={handleSubmit} disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit for Approval
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {isPracticeAdmin && step === 2 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Step 2: Practice details
              </CardTitle>
              <CardDescription>Practice name, phone, at least one location with address, and ZIP are required. Description and website are optional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Practice name *</Label>
                <Input value={practiceName} onChange={(e) => setPracticeName(e.target.value)} />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={practicePhone} onChange={(e) => setPracticePhone(e.target.value)} placeholder="Practice phone" />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea value={practiceDescription} onChange={(e) => setPracticeDescription(e.target.value)} rows={2} />
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input value={practiceWebsite} onChange={(e) => setPracticeWebsite(e.target.value)} placeholder="https://" />
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <Label className="text-sm font-medium">Primary location address *</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">At least address line or city and state required. ZIP is required.</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-muted-foreground">Address line 1</Label>
                    <Input value={practiceAddress.line1} onChange={(e) => setPracticeAddress((a) => ({ ...a, line1: e.target.value }))} placeholder="Street address" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">City</Label>
                    <Input value={practiceAddress.city} onChange={(e) => setPracticeAddress((a) => ({ ...a, city: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">State</Label>
                    <Input value={practiceAddress.state} onChange={(e) => setPracticeAddress((a) => ({ ...a, state: e.target.value }))} maxLength={2} placeholder="e.g. MO" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">ZIP *</Label>
                    <Input value={practiceAddress.zip} onChange={(e) => setPracticeAddress((a) => ({ ...a, zip: e.target.value }))} placeholder="e.g. 63101" />
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="portal-secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="portal-primary" onClick={handleSubmit} disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Approval
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
