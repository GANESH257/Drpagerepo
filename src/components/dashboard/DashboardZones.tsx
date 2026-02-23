'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Search,
  Users,
  BookUser,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Megaphone,
  MessageCircle,
  Award,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doctor } from '@/types';
import { loadAppointmentRequests, loadReferrals } from '@/lib/doctorStorage';
import { getProfileStats } from '@/lib/api/profile-stats';
import { getMyMembership } from '@/lib/api/memberships';
import { getAnnouncements } from '@/lib/api/announcements';
import { getEvents } from '@/lib/api/events';
import { getUnreadCount } from '@/lib/api/messages';
import { getDoctors } from '@/lib/api/doctors';
import { getApprovalRequests } from '@/lib/api/approval-requests';
import { formatDateTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface DashboardZonesProps {
  doctor: Doctor;
}

const ONBOARDING_STEPS = ['Basic Info', 'Credentials', 'Services', 'Insurance'];

export function DashboardZones({ doctor }: DashboardZonesProps) {
  const router = useRouter();
  const [profileViews, setProfileViews] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [networkSize, setNetworkSize] = useState<number | null>(null);
  const [membership, setMembership] = useState<any>(null);
  const [changesRequestedRequest, setChangesRequestedRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const doctorId = doctor.id;
    setLoading(true);
    setLoadError(null);
    try {
      const [refs, apps, stats, ann, ev, unread, membershipRes, approvalList, doctorsRes] = await Promise.all([
        loadReferrals(doctorId).catch(() => []),
        loadAppointmentRequests(doctorId).catch(() => []),
        getProfileStats().catch(() => ({ profile_views_this_month: 0 })),
        getAnnouncements().catch(() => []),
        getEvents().catch(() => []),
        getUnreadCount().catch(() => 0),
        getMyMembership().catch(() => null),
        getApprovalRequests().catch(() => []),
        getDoctors({ limit: 1 }).catch(() => ({ doctors: [], pagination: { total: 0 } })),
      ]);
      setReferrals(Array.isArray(refs) ? refs : []);
      setAppointments(Array.isArray(apps) ? apps : []);
      setProfileViews(stats?.profile_views_this_month ?? 0);
      setAnnouncements(Array.isArray(ann) ? ann.slice(0, 3) : []);
      setEvents(
        Array.isArray(ev)
          ? ev
              .filter((e) => new Date(e.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
          : []
      );
      setUnreadMessages(unread ?? 0);
      setMembership(membershipRes);
      setNetworkSize(doctorsRes?.pagination?.total ?? null);
      const withNotes = Array.isArray(approvalList) ? approvalList.find((r: any) => (r.admin_notes || r.adminNotes) && (r.admin_status === 'pending' || r.admin_status === 'rejected')) : null;
      setChangesRequestedRequest(withNotes || null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [doctor.id]);

  useEffect(() => {
    load();
  }, [load]);

  const profileCompletion = (() => {
    const fields = [
      doctor.firstName,
      doctor.lastName,
      doctor.fullName,
      doctor.specialty,
      doctor.bio,
      doctor.credentials,
      doctor.medicalSchool,
      (doctor.locations?.length ?? 0) > 0,
      (doctor.insurance?.length ?? 0) > 0,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  const now = new Date();
  const thisMonth = referrals.filter((r) => {
    const d = new Date((r as any).date ?? (r as any).created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = referrals.filter((r) => {
    const d = new Date((r as any).date ?? (r as any).created_at);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const receivedThisMonth = thisMonth.filter((r) => (r as any).to_doctor_id === doctor.id || (r as any).toDoctorId === doctor.id);
  const sentThisMonth = thisMonth.filter((r) => (r as any).from_doctor_id === doctor.id || (r as any).fromDoctorId === doctor.id);
  const referralTrend = lastMonth.length > 0 ? (thisMonth.length - lastMonth.length) : 0;

  const isIncomplete = doctor.profileStatus === 'pending_profile' || !doctor.verified;
  const isSubmitted = doctor.profileStatus === 'submitted' || (doctor.verified === false && !changesRequestedRequest);
  const isLive = doctor.verified === true && doctor.profileStatus !== 'pending_profile';
  const membershipExpiry = membership?.expiry_date
    ? new Date(membership.expiry_date)
    : null;
  const expiresSoon = membershipExpiry && membershipExpiry.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000;

  const onboardingStepsComplete = [
    Boolean(doctor.firstName && doctor.lastName && doctor.fullName),
    Boolean(doctor.credentials && doctor.medicalSchool),
    (doctor.insurance?.length ?? 0) > 0 || (doctor.conditionsAndServices?.length ?? 0) > 0,
    (doctor.insurance?.length ?? 0) > 0,
  ];
  const stepsDone = onboardingStepsComplete.filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {loadError && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-900">{loadError}</p>
            <Button variant="outline" size="sm" onClick={() => load()}>Retry</Button>
          </CardContent>
        </Card>
      )}
      {/* Zone 1: Status Banner */}
      <div className="space-y-3">
        {isIncomplete && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900">Complete your profile</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    {stepsDone} of {ONBOARDING_STEPS.length} steps complete
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-amber-200">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${(stepsDone / ONBOARDING_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <ul className="mt-3 text-sm text-amber-800 space-y-1">
                    {ONBOARDING_STEPS.map((step, i) => (
                      <li key={step} className={onboardingStepsComplete[i] ? 'line-through opacity-70' : ''}>
                        {step}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-4" onClick={() => router.push('/doctor/dashboard/complete-profile')}>
                    Continue Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {!isIncomplete && isSubmitted && !changesRequestedRequest && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-900">
                Your profile is under review by AIP Administration. We will notify you once it is approved.
              </p>
            </CardContent>
          </Card>
        )}
        {changesRequestedRequest && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                <h3 className="font-semibold text-red-900">Changes requested</h3>
              </div>
              <p className="text-sm text-red-800">
                {(changesRequestedRequest.admin_notes ?? changesRequestedRequest.adminNotes) || 'Please review feedback and update your profile.'}
              </p>
              <Button variant="destructive" size="sm" onClick={() => router.push('/doctor/dashboard/profile')}>
                View Feedback & Update Profile
              </Button>
            </CardContent>
          </Card>
        )}
        {isLive && !expiresSoon && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <span className="font-medium text-green-900">Your profile is live in the public directory.</span>
              </div>
              <Link href="/doctor/dashboard/profile/public">
                <Button variant="outline" size="sm">View profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}
        {expiresSoon && membershipExpiry && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-900">
                Membership expires soon ({membershipExpiry.toLocaleDateString()}). Renew to continue access.
              </p>
              <Link href="/doctor/dashboard/membership">
                <Button size="sm">Renew</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Zone 2: Key Metrics */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Key metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileCompletion}%</div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-brand-teal" style={{ width: `${profileCompletion}%` }} />
              </div>
              <Link href="/doctor/dashboard/profile">
                <Button variant="link" className="p-0 h-auto text-xs mt-1">Edit profile</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Profile Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileViews}</div>
              <p className="text-xs text-gray-500 mt-1">this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Referrals Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{receivedThisMonth.length}</span>
                {referralTrend !== 0 && (
                  <Badge variant={referralTrend > 0 ? 'default' : 'secondary'} className="text-xs">
                    {referralTrend > 0 ? '↑' : '↓'} vs last month
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Referrals Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentThisMonth.length}</div>
              <p className="text-xs text-gray-500 mt-1">this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Network Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkSize ?? '—'}</div>
              <p className="text-xs text-gray-500 mt-1">physicians in AIP</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadMessages}</div>
              <Link href="/doctor/dashboard/messages">
                <Button variant="link" className="p-0 h-auto text-xs mt-1">Open Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zone 3: Activity Feed & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Referrals</CardTitle>
            <Link href="/doctor/dashboard/referrals">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-sm text-gray-500">No referrals yet.</p>
            ) : (
              <ul className="space-y-2">
                {referrals.slice(0, 5).map((r) => (
                  <li key={(r as any).id} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="truncate">
                      {(r as any).from_doctor_name ?? (r as any).fromDoctorName ?? 'From'} → {(r as any).to_doctor_name ?? (r as any).toDoctorName ?? 'To'}
                    </span>
                    <Badge variant="outline" className="text-xs">{(r as any).status ?? '—'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest Announcements</CardTitle>
            <Link href="/doctor/dashboard/community/announcements">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements.</p>
            ) : (
              <ul className="space-y-2">
                {announcements.map((a) => (
                  <li key={a.id} className="text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium">{a.title}</span>
                    <span className="text-gray-500 text-xs block">{formatDateTime(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming Events</CardTitle>
          <Link href="/doctor/dashboard/community/announcements">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium">{e.title}</span>
                  <span className="text-gray-500 text-xs block">{e.location} · {formatDateTime(e.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push('/doctor/dashboard/profile')}>
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => router.push('/doctor/dashboard/find-physician')}>
              <Search className="h-4 w-4 mr-2" />
              Find a Physician
            </Button>
            <Button variant="outline" onClick={() => router.push('/doctor/dashboard/referrals')}>
              <Users className="h-4 w-4 mr-2" />
              Send a Referral
            </Button>
            <Button variant="outline" onClick={() => router.push('/doctor/dashboard/find-physician/contacts')}>
              <BookUser className="h-4 w-4 mr-2" />
              View My Contacts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
