'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDoctorSession } from '@/lib/useDoctorSession';
import { getDoctor } from '@/lib/api/doctors';
import { getPractice } from '@/lib/api/practices';
import { createApprovalRequest } from '@/lib/api/approval-requests';
import {
  validateProfileForCompletion,
  validatePracticeForCompletion,
  buildDoctorPayloadForCompletion,
  buildPracticePayloadForCompletion,
  buildLocationsFromPractice,
  type PracticeForValidation,
} from '@/lib/pendingProfileCompletion';
import { geocodeZip } from '@/lib/services/geocodingService';
import { User, Building, Send, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardDashboardPage() {
  const router = useRouter();
  const { getToken: getSessionToken, getUser } = useDoctorSession();
  const user = getUser();
  const isPA = user?.roleInPractice === 'practice_admin';

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submittedFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('submitted') === '1';
  const showSubmittedState = submitted || submittedFromUrl;

  // If login didn't send profile_status, we sent doctor here. If they're already approved, send to dashboard.
  useEffect(() => {
    const token = getSessionToken();
    const doctorId = user?.doctorId;
    if (!token || !doctorId) return;
    getDoctor(doctorId, token)
      .then((d) => {
        if (d.profileStatus === 'active' || d.verified === true) {
          router.replace('/doctor/dashboard');
        }
      })
      .catch(() => {});
  }, [user?.doctorId, getSessionToken, router]);

  const handleSubmit = async () => {
    const token = getSessionToken();
    const doctorId = user?.doctorId;
    if (!token || !doctorId) {
      setSubmitError('Session expired. Please sign in again.');
      return;
    }

    let doctor: Awaited<ReturnType<typeof getDoctor>>;
    let practice: PracticeForValidation | null = null;

    try {
      doctor = await getDoctor(doctorId, token);
    } catch (e) {
      setSubmitError('Could not load your profile. Try again.');
      return;
    }

    const profileErr = validateProfileForCompletion(doctor);
    if (profileErr) {
      setSubmitError(profileErr);
      return;
    }

    if (isPA && doctor.practiceId) {
      try {
        const p = await getPractice(doctor.practiceId, token);
        const addr = p?.address && typeof p.address === 'object' ? p.address : {};
        practice = {
          id: p?.id,
          name: p?.name,
          phone: p?.phone,
          description: (p as { description?: string })?.description,
          website: (p as { website?: string })?.website,
          address: addr as { line1?: string; line2?: string; city?: string; state?: string; zip?: string },
          address_line1: (p as { address_line1?: string })?.address_line1 ?? (addr as { line1?: string })?.line1,
          city: (p as { city?: string })?.city ?? (addr as { city?: string })?.city,
          state: (p as { state?: string })?.state ?? (addr as { state?: string })?.state,
          zip: (p as { zip?: string })?.zip ?? (addr as { zip?: string })?.zip,
          locations: Array.isArray(p?.locations) ? p.locations : [],
        };
      } catch {
        setSubmitError('Could not load practice. Try again.');
        return;
      }
      const practiceErr = validatePracticeForCompletion(practice);
      if (practiceErr) {
        setSubmitError(practiceErr);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const doctorPayload = buildDoctorPayloadForCompletion(doctor);

      if (isPA && practice && doctor.practiceId) {
        let primaryLat: number | null = null;
        let primaryLng: number | null = null;
        const addr = practice.address ?? {};
        const zip5 = (practice.zip ?? (addr as { zip?: string })?.zip ?? '').toString().replace(/\D/g, '').slice(0, 5);
        if (zip5.length === 5) {
          try {
            const coords = await geocodeZip(zip5);
            primaryLat = coords.lat;
            primaryLng = coords.lng;
          } catch {
            /* ignore */
          }
        }
        const locationsToSend = buildLocationsFromPractice(
          practice as PracticeForValidation & { id: string },
          primaryLat,
          primaryLng
        );
        const practicePayload = buildPracticePayloadForCompletion(
          practice as PracticeForValidation & { id: string },
          locationsToSend
        );
        await createApprovalRequest({
          type: 'practice_admin_profile_practice_completion',
          practice_id: doctor.practiceId,
          target_doctor_id: doctor.id,
          payload: {
            doctorId: doctor.id,
            practiceId: doctor.practiceId,
            doctor: doctorPayload,
            practice: practicePayload,
            locations: locationsToSend,
          },
        });
      } else {
        await createApprovalRequest({
          type: 'doctor_profile_completion',
          target_doctor_id: doctor.id,
          payload: { doctorId: doctor.id, doctor: doctorPayload },
        });
      }

      setSubmitted(true);
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        u.searchParams.set('submitted', '1');
        window.history.replaceState({}, '', u.toString());
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (showSubmittedState) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-[var(--aip-teal)]/30 bg-[var(--aip-teal)]/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--aip-teal)]/20">
                <CheckCircle2 className="h-7 w-7 text-[var(--aip-teal)]" />
              </div>
              <div>
                <CardTitle className="text-xl" style={{ color: 'var(--aip-teal)' }}>
                  Submitted
                </CardTitle>
                <CardDescription className="mt-1">
                  Your profile has been submitted for approval.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can&apos;t access the full dashboard yet — you&apos;ll get access once an admin approves your profile.
              We&apos;ll notify you when you&apos;re approved, or you can sign in later to check.
            </p>
            <p className="text-sm text-muted-foreground">
              Until then, you can still edit your profile or practice from the links in the sidebar if you need to change anything.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Complete your profile</h2>
        <p className="text-muted-foreground mt-1">
          Your join request was approved. Complete these steps and submit for approval to get full access to the doctor portal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--aip-teal)]/15 text-[var(--aip-teal)]">
              <span className="text-lg font-bold">1</span>
            </div>
            <div>
              <CardTitle>Complete your profile</CardTitle>
              <CardDescription>Add your bio, credentials, contact info, insurance, and services.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-lg" style={{ background: 'var(--aip-teal)', color: 'white' }}>
              <Link href="/doctor/onboard/profile">
                Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {isPA && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--aip-teal)]/15 text-[var(--aip-teal)]">
                <span className="text-lg font-bold">2</span>
              </div>
              <div>
                <CardTitle>Complete your practice</CardTitle>
                <CardDescription>Add practice name, contact, address, and locations.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="rounded-lg" style={{ borderColor: 'var(--aip-teal)', color: 'var(--aip-teal)' }}>
                <Link href="/doctor/onboard/practice">
                  Edit Practice <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--aip-teal)]/15 text-[var(--aip-teal)]">
              <span className="text-lg font-bold">{isPA ? '3' : '2'}</span>
            </div>
            <div>
              <CardTitle>Submit for approval</CardTitle>
              <CardDescription>Send your profile (and practice if applicable) for approval. After approval you’ll get full access to the doctor portal.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))', color: 'white' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit for approval
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
