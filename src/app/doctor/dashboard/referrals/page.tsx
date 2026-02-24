'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Referral, ReferralStatus } from '@/types/referrals';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { getReferralTimeline } from '@/lib/services/referralEngine';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { getReferrals as getReferralsAPI, updateReferral as updateReferralAPI } from '@/lib/api/referrals';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';
import { getMyContacts } from '@/lib/api/contacts';
import { Doctor } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { toast } from '@/lib/toast';
import { Eye, CheckCircle, XCircle, ArrowRight, User, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReferralDialog } from '@/components/shared/referrals/ReferralDialog';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';
import { normalizeReferralStatus, getReferralStatusLabel } from '@/lib/utils/referralStatusLabels';

export default function ReferralsV2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralIdParam = searchParams.get('referralId');
  const tabParam = searchParams.get('tab') as 'sent' | 'received' | null;

  const [referralsSent, setReferralsSent] = useState<Referral[]>([]);
  const [referralsReceived, setReferralsReceived] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNewReferralDialog, setShowNewReferralDialog] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'sent' | 'received' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [networkDoctors, setNetworkDoctors] = useState<Doctor[]>([]);
  const [networkDoctorsLoading, setNetworkDoctorsLoading] = useState(true);
  const [networkDoctorsError, setNetworkDoctorsError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{ id: string; full_name: string; specialty?: string }[]>([]);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    networkDoctors.forEach(d => {
      const s = d.specialty ?? (d as any).specialties?.[0];
      if (s) set.add(s);
    });
    return Array.from(set).sort();
  }, [networkDoctors]);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return networkDoctors.filter(d => {
      const name = (d.fullName ?? (d as any).full_name ?? '').toString().toLowerCase();
      const specialty = (d.specialty ?? (d as any).specialties?.[0] ?? '').toString();
      return name.includes(q) && (specialtyFilter === 'all' || specialty === specialtyFilter);
    });
  }, [networkDoctors, searchQuery, specialtyFilter]);

  const mapApiToReferral = (r: any): Referral => ({
    id: r.id,
    createdAt: r.created_at ?? r.createdAt ?? '',
    updatedAt: r.updated_at ?? r.updatedAt ?? '',
    fromDoctorId: r.from_doctor_id ?? r.fromDoctorId ?? '',
    toDoctorId: r.to_doctor_id ?? r.toDoctorId ?? '',
    patient: {
      name: r.patient_name_or_initials ?? r.patient?.name,
      sex: (r.patient_sex ?? r.patient?.sex) as 'male' | 'female' | 'other' | undefined,
    },
    condition: r.condition_summary ?? r.condition ?? '',
    notes: r.notes,
    status: normalizeReferralStatus(r.status),
  });

  const loadReferralsAndDoctors = useCallback(async () => {
    try {
      const actor = getActorFromSession();
      assertDoctor(actor);
      if (actor.kind !== 'doctor' || !actor.doctorId) throw new PermissionDeniedError('Must be a doctor');
      const token = getToken();
      const [apiList, doctorsList, contactsList] = await Promise.all([
        getReferralsAPI(actor.doctorId),
        getAllDoctorsArray(token ?? undefined),
        getMyContacts().catch(() => []),
      ]);
      const all = (Array.isArray(apiList) ? apiList : []).map(mapApiToReferral);
      setReferralsSent(all.filter((r) => r.fromDoctorId === actor.doctorId));
      setReferralsReceived(all.filter((r) => r.toDoctorId === actor.doctorId));
      setNetworkDoctors(Array.isArray(doctorsList) ? doctorsList : []);
      setContacts(Array.isArray(contactsList) ? contactsList : []);
      setNetworkDoctorsError(null);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
        return;
      }
      if (error instanceof PermissionDeniedError) {
        router.push('/doctor/dashboard');
        return;
      }
      setNetworkDoctorsError(error instanceof Error ? error.message : 'Failed to load physicians');
      setNetworkDoctors([]);
    } finally {
      setIsLoading(false);
      setNetworkDoctorsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void loadReferralsAndDoctors();
    return () => { cancelled = true; };
  }, [loadReferralsAndDoctors]);

  // Deep linking: auto-open dialog if referralId is in URL
  useEffect(() => {
    if (referralIdParam && !isLoading && (referralsSent.length > 0 || referralsReceived.length > 0)) {
      const allReferrals = [...referralsSent, ...referralsReceived];
      const referral = allReferrals.find(r => r.id === referralIdParam);

      if (referral) {
        const isReceived = referralsReceived.some(r => r.id === referralIdParam);
        const correctTab = isReceived ? 'received' : 'sent';
        setFilterTab(correctTab);

        // Open dialog (inline logic to avoid dependency issue)
        setSelectedReferral(referral);
        try {
          const actor = getActorFromSession();
          if (actor.kind === 'doctor') {
            const history = getReferralTimeline(actor, referral.id, referral);
            setTimeline(history);
          }
        } catch (error) {
          console.error('Failed to load timeline:', error);
        }
        setShowDetailDialog(true);
      } else {
        // Referral not found
        toast.error('Referral not found');
        // Remove param from URL
        router.replace('/doctor/dashboard/referrals');
      }
    }
  }, [referralIdParam, isLoading, referralsSent, referralsReceived, router]);

  const handleStatusChange = async (referralId: string, newStatus: ReferralStatus) => {
    try {
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor') {
        throw new PermissionDeniedError('Must be a doctor');
      }

      await updateReferralAPI(referralId, { status: newStatus });
      toast.success(`Referral marked as ${getReferralStatusLabel(newStatus)}`);
      await loadReferralsAndDoctors();

      // Reload timeline if dialog is open for this referral
      if (selectedReferral?.id === referralId && showDetailDialog) {
        try {
          const history = getReferralTimeline(actor, referralId, selectedReferral);
          setTimeline(history);
        } catch (error) {
          console.error('Failed to reload timeline:', error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update referral status');
    }
  };

  const handleViewDetail = (referral: Referral) => {
    setSelectedReferral(referral);
    try {
      const actor = getActorFromSession();
      if (actor.kind === 'doctor') {
        // Pass referral so timeline works for API-sourced referrals (not in localStorage)
        const history = getReferralTimeline(actor, referral.id, referral);
        setTimeline(history);
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
    setShowDetailDialog(true);
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const variants: Record<ReferralStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      considering: 'outline',
      accepted: 'default',
      no_show: 'secondary',
      cancelled: 'destructive',
    };
    return variants[status];
  };

  const statusPillClass = (status: ReferralStatus) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'considering': return 'bg-amber-100 text-amber-800';
      case 'no_show': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDoctorName = (doctorId: string): string => {
    const doctor = networkDoctors.find(d => d.id === doctorId);
    return (doctor?.fullName ?? (doctor as any)?.full_name) || doctorId;
  };

  const getDoctorSpecialty = (doctorId: string): string => {
    const doctor = networkDoctors.find(d => d.id === doctorId);
    return (doctor?.specialty ?? (doctor as any)?.specialties?.[0]) || '—';
  };

  type TableRow = Referral & { type: 'sent' | 'received'; physicianName: string; physicianSpecialty: string };
  const tableRows = useMemo((): TableRow[] => {
    const sent: TableRow[] = referralsSent.map(r => ({
      ...r,
      type: 'sent' as const,
      physicianName: getDoctorName(r.toDoctorId),
      physicianSpecialty: getDoctorSpecialty(r.toDoctorId),
    }));
    const received: TableRow[] = referralsReceived.map(r => ({
      ...r,
      type: 'received' as const,
      physicianName: getDoctorName(r.fromDoctorId),
      physicianSpecialty: getDoctorSpecialty(r.fromDoctorId),
    }));
    const all = [...sent, ...received].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filterTab === 'sent') return all.filter(r => r.type === 'sent');
    if (filterTab === 'received') return all.filter(r => r.type === 'received');
    if (filterTab === 'pending') return all.filter(r => r.status === 'considering');
    return all;
  }, [referralsSent, referralsReceived, filterTab, networkDoctors]);

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aip-teal)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 relative z-10 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Referrals</h1>
          <p className="mt-0.5 text-xs text-gray-600">Manage all incoming and outgoing patient referrals</p>
        </div>
        <Button
          onClick={() => setShowNewReferralDialog(true)}
          className="rounded-lg bg-[var(--aip-teal)] hover:bg-[var(--aip-teal)]/90 text-white h-9 text-sm shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Referral
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1">
        {(['all', 'sent', 'received', 'pending'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTab(tab)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              filterTab === tab
                ? 'bg-[var(--aip-teal)] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left font-semibold text-gray-900 py-3 px-4">PATIENT</th>
                <th className="text-left font-semibold text-gray-900 py-3 px-4">PHYSICIAN</th>
                <th className="text-left font-semibold text-gray-900 py-3 px-4">SPECIALTY</th>
                <th className="text-left font-semibold text-gray-900 py-3 px-4">TYPE</th>
                <th className="text-left font-semibold text-gray-900 py-3 px-4">STATUS</th>
                <th className="text-left font-semibold text-gray-900 py-3 px-4">DATE</th>
                <th className="text-left font-semibold text-gray-900 py-3 px-4">VIEW</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No referrals match this filter.
                  </td>
                </tr>
              ) : (
                tableRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-900">{row.patient?.name || '—'}</td>
                    <td className="py-3 px-4 text-gray-900">{row.physicianName}</td>
                    <td className="py-3 px-4 text-gray-600">{row.physicianSpecialty}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          row.type === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-violet-100 text-violet-800'
                        )}
                      >
                        {row.type === 'sent' ? 'Sent' : 'Received'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusPillClass(row.status))}>
                        {getReferralStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatShortDate(row.createdAt)}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(row)}
                        className="text-[var(--aip-teal)] font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedReferral && (
        <Dialog
          open={showDetailDialog}
          onOpenChange={(open) => {
            setShowDetailDialog(open);
            if (!open && (referralIdParam || tabParam)) router.replace('/doctor/dashboard/referrals');
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Referral Details</DialogTitle>
              <p className="text-sm text-gray-600">
                Referral from {getDoctorName(selectedReferral.fromDoctorId)} to {getDoctorName(selectedReferral.toDoctorId)}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Condition</h4>
                <p className="text-gray-700">{selectedReferral.condition}</p>
              </div>
              {selectedReferral.patient.name && (
                <div>
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <p className="text-gray-700">
                    Name: {selectedReferral.patient.name}
                    {selectedReferral.patient.dob && `, DOB: ${selectedReferral.patient.dob}`}
                    {selectedReferral.patient.sex && `, Sex: ${selectedReferral.patient.sex}`}
                  </p>
                </div>
              )}
              {selectedReferral.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-gray-700">{selectedReferral.notes}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusPillClass(selectedReferral.status))}>
                  {getReferralStatusLabel(selectedReferral.status)}
                </span>
              </div>
              {selectedReferral.status === 'considering' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Update status</label>
                  <Select
                    value={selectedReferral.status}
                    onValueChange={(value) => handleStatusChange(selectedReferral.id, value as ReferralStatus)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accepted">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                          Accepted
                        </div>
                      </SelectItem>
                      <SelectItem value="no_show">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          No Show
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <Timeline records={timeline} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Referral dialog — Find Physicians */}
      <Dialog open={showNewReferralDialog} onOpenChange={setShowNewReferralDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Find & Refer Physicians</DialogTitle>
            <p className="text-sm text-gray-600">Search the network to send a peer-to-peer referral</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search by name..."
                className="flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          <div className="mt-4">
            {networkDoctorsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 py-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border p-3 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : networkDoctorsError ? (
              <div className="py-12 text-center">
                <p className="text-gray-600 mb-2">{networkDoctorsError}</p>
                <Button variant="outline" size="sm" onClick={() => { setNetworkDoctorsError(null); setNetworkDoctorsLoading(true); void loadReferralsAndDoctors(); }}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 max-h-[50vh] overflow-y-auto">
                {filteredDoctors.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    No physicians found matching your criteria.
                  </div>
                ) : (
                  filteredDoctors.map((doc) => {
                    const displayName = doc.fullName ?? (doc as any).full_name ?? '—';
                    const displaySpecialty = doc.specialty ?? (doc as any).specialties?.[0] ?? '—';
                    const profileHref = getDoctorProfileUrl(doc);
                    return (
                      <div key={doc.id} className="flex items-center gap-3 rounded-xl border p-3 hover:border-[var(--aip-teal)]/50 hover:bg-[var(--aip-teal)]/5">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--aip-teal)]/20 text-[var(--aip-teal)] text-sm font-bold">
                          {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate">{displayName}</div>
                          <div className="text-xs text-gray-500 truncate">{displaySpecialty}</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Link href={profileHref} className="text-xs font-medium text-[var(--aip-teal)] hover:underline">
                              <User className="mr-1 h-3 w-3 inline" />
                              View Profile
                            </Link>
                            <ReferralDialog
                              doctor={doc}
                              trigger={
                                <button className="text-xs font-medium text-[var(--aip-teal)] hover:underline">
                                  Send Referral
                                  <ArrowRight className="ml-1 h-3 w-3 inline" />
                                </button>
                              }
                              onSuccess={() => {
                                void loadReferralsAndDoctors();
                                setShowNewReferralDialog(false);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
