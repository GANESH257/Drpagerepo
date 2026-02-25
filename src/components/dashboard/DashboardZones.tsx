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
  MessageCircle,
  Send,
  Inbox,
  Stethoscope,
  ArrowRight,
  Clock,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Doctor } from '@/types';
import { loadAppointmentRequests } from '@/lib/doctorStorage';
import { getReferrals } from '@/lib/api/referrals';
import { getProfileStats } from '@/lib/api/profile-stats';
import { getMyMembership } from '@/lib/api/memberships';
import { getAnnouncements } from '@/lib/api/announcements';
import { getEvents } from '@/lib/api/events';
import { subscribeToTotalUnreadCount } from '@/lib/messageStorage';
import { getDoctors } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { getApprovalRequests } from '@/lib/api/approval-requests';
import { formatDateTime } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface DashboardZonesProps {
  doctor: Doctor;
}

const ONBOARDING_STEPS = [
  { label: 'Basic Info', doneKey: 0 },
  { label: 'Credentials', doneKey: 1 },
  { label: 'Services & Insurance', doneKey: 2 },
  { label: 'Submit for Approval', doneKey: 3 },
];

function getStatusBadgeClass(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('accept') || s === 'accepted') return 'badge-accepted';
  if (s.includes('sent')) return 'badge-sent';
  if (s.includes('pending')) return 'badge-pending';
  if (s.includes('complete') || s === 'completed') return 'badge-completed';
  if (s.includes('live') || s === 'active') return 'badge-live';
  if (s.includes('review')) return 'badge-review';
  return 'badge-pending';
}

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
        getReferrals(doctorId).catch(() => []),
        loadAppointmentRequests(doctorId).catch(() => []),
        getProfileStats().catch(() => ({ profile_views_this_month: 0 })),
        getAnnouncements().catch(() => []),
        getEvents().catch(() => []),
        Promise.resolve(0), // unread count handled by Firestore subscription below
        getMyMembership().catch(() => null),
        getApprovalRequests().catch(() => []),
        getDoctors({ limit: 1 }, getToken() ?? undefined).catch(() => ({ doctors: [], pagination: { total: 0 } })),
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

  // Real-time Firestore unread message count — replaces the REST API poll which
  // always returned 0 because messages are stored in Firestore, not PostgreSQL.
  useEffect(() => {
    if (!doctor.id) return;
    const unsub = subscribeToTotalUnreadCount(doctor.id, (count) => {
      setUnreadMessages(count);
    });
    return unsub;
  }, [doctor.id]);

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
    const d = new Date((r as any).created_at ?? (r as any).date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = referrals.filter((r) => {
    const d = new Date((r as any).created_at ?? (r as any).date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const receivedThisMonth = thisMonth.filter((r) => (r as any).to_doctor_id === doctor.id || (r as any).toDoctorId === doctor.id);
  const sentThisMonth = thisMonth.filter((r) => (r as any).from_doctor_id === doctor.id || (r as any).fromDoctorId === doctor.id);
  const sentLastMonth = lastMonth.filter((r) => (r as any).from_doctor_id === doctor.id || (r as any).fromDoctorId === doctor.id);
  const referralTrend = sentLastMonth.length > 0 || sentThisMonth.length > 0 ? sentThisMonth.length - sentLastMonth.length : 0;

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
    (doctor.insurance?.length ?? 0) > 0 || (doctor.conditionServices?.length ?? 0) > 0 || (doctor.conditionsAndServices?.length ?? 0) > 0,
    (doctor.insurance?.length ?? 0) > 0,
  ];
  const stepsDone = onboardingStepsComplete.filter(Boolean).length;
  const onboardingPct = Math.round((stepsDone / ONBOARDING_STEPS.length) * 100);

  const shortName = doctor.fullName?.startsWith('Dr.') ? doctor.fullName : `Dr. ${doctor.lastName || doctor.fullName || 'User'}`;
  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const practiceName = (doctor as any).practiceName || doctor.practiceName || 'AIP Member';

  const statusLabel = (() => {
    if (isLive) return 'Live';
    if (changesRequestedRequest) return 'Changes Requested';
    if (isSubmitted) return 'Pending AIP Review';
    if (isIncomplete) return 'Pending Profile';
    return 'Member';
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aip-teal)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10">
      {loadError && (
        <div className="glass-card p-4 flex items-center gap-3 border-amber-200 bg-amber-50/50">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-900">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => load()}>Retry</Button>
        </div>
      )}

      {/* Welcome + status */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting}, {shortName} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {dateStr}
            &nbsp;·&nbsp;{doctor.specialty || 'Physician'}
            &nbsp;·&nbsp;{practiceName}
          </p>
        </div>
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadgeClass(statusLabel))}>
          {statusLabel}
        </span>
      </div>

      {/* Onboarding / status card — single card in reference style */}
      {(isIncomplete || isSubmitted || changesRequestedRequest || isLive || expiresSoon) && (
        <div className="glass-card p-5">
          {isIncomplete && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Onboarding Progress</p>
                  <h2 className="text-lg font-bold text-foreground mt-0.5">Complete Your Profile</h2>
                </div>
                <span className="text-2xl font-black" style={{ color: 'var(--aip-gold)' }}>{onboardingPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted mb-4">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${onboardingPct}%`, background: 'linear-gradient(90deg, var(--aip-teal), var(--aip-navy))' }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex flex-wrap gap-3">
                  {ONBOARDING_STEPS.map((step, i) => (
                    <span key={step.label} className="flex items-center gap-1.5 text-sm">
                      {onboardingStepsComplete[i] ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={onboardingStepsComplete[i] ? 'text-foreground' : 'text-muted-foreground'}>{step.label}</span>
                    </span>
                  ))}
                </div>
                <Button
                  variant="portal-primary"
                  size="sm"
                  onClick={() => router.push('/doctor/dashboard/complete-profile')}
                >
                  Continue Setup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
          {!isIncomplete && isSubmitted && !changesRequestedRequest && (
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 shrink-0" />
              <p className="text-sm text-foreground">
                Your profile is under review by AIP Administration. We will notify you once it is approved.
              </p>
            </div>
          )}
          {changesRequestedRequest && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                <h3 className="font-semibold text-foreground">Changes requested</h3>
              </div>
              <p className="text-sm text-foreground">
                {(changesRequestedRequest.admin_notes ?? changesRequestedRequest.adminNotes) || 'Please review feedback and update your profile.'}
              </p>
              <Button variant="destructive" size="sm" onClick={() => router.push('/doctor/dashboard/profile')}>
                View Feedback & Update Profile
              </Button>
            </div>
          )}
          {isLive && !expiresSoon && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <span className="font-medium text-foreground">Your profile is live in the public directory.</span>
              </div>
              <Link href="/doctor/dashboard/profile/public">
                <Button variant="outline" size="sm">View profile</Button>
              </Link>
            </div>
          )}
          {expiresSoon && membershipExpiry && (
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
              <p className="text-sm text-foreground">
                Membership expires soon ({membershipExpiry.toLocaleDateString()}). Renew to continue access.
              </p>
              <Link href="/doctor/dashboard/membership">
                <Button size="sm" variant="portal-primary">Renew</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Metric cards — reference style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Send, label: 'Referrals Sent', value: String(sentThisMonth.length), sub: referralTrend !== 0 ? `${referralTrend >= 0 ? '+' : ''}${referralTrend} vs last month` : 'this month', trend: referralTrend > 0 ? 'up' : null, color: 'var(--aip-teal)' },
          { icon: Inbox, label: 'Referrals Received', value: String(receivedThisMonth.length), sub: 'this month', trend: null, color: 'var(--aip-navy)' },
          { icon: Stethoscope, label: 'AIP Network', value: networkSize != null ? networkSize.toLocaleString() : '—', sub: 'Physicians', trend: null, color: 'var(--aip-teal)' },
          { icon: MessageCircle, label: 'Unread Messages', value: String(unreadMessages), sub: 'View Messages →', trend: null, color: 'var(--aip-gold)', action: () => router.push('/doctor/dashboard/messages') },
        ].map((card) => (
          <div
            key={card.label}
            className="glass-card p-4 cursor-pointer"
            onClick={card.action}
            role={card.action ? 'button' : undefined}
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
            </div>
            <div className="text-3xl font-black text-foreground">{card.value}</div>
            <div className="flex items-center gap-1 mt-1">
              {card.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              <span className="text-xs text-muted-foreground">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Referrals + Announcements — two columns */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Referrals</h3>
            <Link href="/doctor/dashboard/referrals" className="text-xs font-medium flex items-center gap-1 text-[var(--aip-teal)] hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No referrals yet.</p>
            ) : (
              <table className="w-full text-sm portal-table">
                <thead>
                  <tr>
                    {['Patient', 'Referred To', 'Condition', 'Status', 'Date'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {referrals.slice(0, 5).map((r) => {
                    const created = (r as any).created_at ?? (r as any).date;
                    const dateLabel = created ? new Date(created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).split(',')[0] : '—';
                    const toName = (r as any).to_doctor_name ?? (r as any).toDoctorName ?? '—';
                    const patient = (r as any).patient_name_or_initials ?? (r as any).patientNameOrInitials ?? '—';
                    const condition = (r as any).condition_summary ?? (r as any).conditionSummary ?? '—';
                    const status = (r as any).status ?? '—';
                    return (
                      <tr key={(r as any).id}>
                        <td className="font-medium">{patient}</td>
                        <td>{toName}</td>
                        <td className="max-w-[120px] truncate" title={condition}>{condition}</td>
                        <td>
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadgeClass(status))}>
                            {status}
                          </span>
                        </td>
                        <td>{dateLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Latest Announcements</h3>
            <Link href="/doctor/dashboard/community/announcements" className="text-xs font-medium flex items-center gap-1 text-[var(--aip-teal)] hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="border-l-2 pl-3" style={{ borderColor: 'var(--aip-teal)' }}>
                  <p className="text-sm font-semibold text-foreground leading-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(a.created_at)}</p>
                  {a.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>}
                </div>
              ))
            )}
          </div>
          {events.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Upcoming Events</p>
              <div className="flex flex-wrap gap-2">
                {events.slice(0, 3).map((e) => (
                  <span key={e.id} className="text-xs px-2 py-1 rounded-md bg-muted text-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {e.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push('/doctor/dashboard/profile')} className="rounded-lg">
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" onClick={() => router.push('/doctor/dashboard/find-physician')} className="rounded-lg">
            <Search className="h-4 w-4 mr-2" />
            Find a Physician
          </Button>
          <Button variant="outline" onClick={() => router.push('/doctor/dashboard/referrals')} className="rounded-lg">
            <Users className="h-4 w-4 mr-2" />
            Send a Referral
          </Button>
          <Button variant="outline" onClick={() => router.push('/doctor/dashboard/find-physician/contacts')} className="rounded-lg">
            <BookUser className="h-4 w-4 mr-2" />
            View My Contacts
          </Button>
        </div>
      </div>
    </div>
  );
}
