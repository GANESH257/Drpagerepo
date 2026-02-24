'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Referral, ReferralStatus } from '@/types/referrals';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { getReferralTimeline } from '@/lib/services/referralEngine';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { getReferrals as getReferralsAPI, updateReferral as updateReferralAPI } from '@/lib/api/referrals';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getMyContacts } from '@/lib/api/contacts';
import { Doctor } from '@/types';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { Eye, CheckCircle, XCircle, ArrowRight, User } from 'lucide-react';
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
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'search'>('received');
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
      const [apiList, doctorsList, contactsList] = await Promise.all([
        getReferralsAPI(actor.doctorId),
        getAllDoctorsArray(),
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
    loadReferralsAndDoctors().then(() => { if (cancelled) return; });
    return () => { cancelled = true; };
  }, [loadReferralsAndDoctors]);

  // Deep linking: auto-open dialog if referralId is in URL
  useEffect(() => {
    if (referralIdParam && !isLoading && (referralsSent.length > 0 || referralsReceived.length > 0)) {
      const allReferrals = [...referralsSent, ...referralsReceived];
      const referral = allReferrals.find(r => r.id === referralIdParam);

      if (referral) {
        // Determine correct tab
        const isReceived = referralsReceived.some(r => r.id === referralIdParam);
        const correctTab = isReceived ? 'received' : 'sent';

        // Switch tab if needed
        if (tabParam && tabParam !== correctTab) {
          setActiveTab(correctTab);
        } else if (!tabParam) {
          setActiveTab(correctTab);
        }

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
  }, [referralIdParam, isLoading, referralsSent, referralsReceived, tabParam, router]);

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

  const getDoctorName = (doctorId: string): string => {
    const doctor = networkDoctors.find(d => d.id === doctorId);
    return (doctor?.fullName ?? (doctor as any)?.full_name) || doctorId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Referrals"
        description="Manage your referrals sent and received"
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sent' | 'received' | 'search')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Received ({referralsReceived.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({referralsSent.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            Find Physicians
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {contacts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">My Contacts</CardTitle>
                <CardDescription>Quick send a referral to a saved contact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contacts.map((c) => (
                    <ReferralDialog
                      key={c.id}
                      doctor={{ id: c.id, fullName: c.full_name, specialty: c.specialty } as Doctor}
                      trigger={<Button variant="outline" size="sm">{c.full_name} — Send referral</Button>}
                      onSuccess={loadReferralsAndDoctors}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Find & Refer Physicians</CardTitle>
              <CardDescription>Search our network to initiate a peer-to-peer referral</CardDescription>
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
            </CardHeader>
            <CardContent>
              {networkDoctorsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  <Button variant="outline" size="sm" onClick={() => { setNetworkDoctorsError(null); setNetworkDoctorsLoading(true); window.location.reload(); }}>
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDoctors.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">
                      No physicians found matching your criteria.
                    </div>
                  ) : (
                    filteredDoctors.map((doc) => {
                      const displayName = doc.fullName ?? (doc as any).full_name ?? '—';
                      const displaySpecialty = doc.specialty ?? (doc as any).specialties?.[0] ?? '—';
                      const profileHref = getDoctorProfileUrl(doc);
                      return (
                        <div key={doc.id} className="group relative flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-brand-teal/50 hover:bg-brand-teal/5">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-dark-blue/10 text-brand-dark-blue text-lg font-bold">
                            {displayName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate">{displayName}</div>
                            <div className="text-xs text-gray-500 truncate">{displaySpecialty}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Link
                                href={profileHref}
                                className="inline-flex items-center text-[11px] font-bold text-brand-dark-blue hover:underline"
                              >
                                <User className="mr-1 h-3 w-3" />
                                View Profile
                              </Link>
                              <ReferralDialog
                                doctor={doc}
                                trigger={
                                  <button className="inline-flex items-center text-[11px] font-bold text-brand-dark-blue hover:underline">
                                    Send Referral
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                  </button>
                                }
                                onSuccess={loadReferralsAndDoctors}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {referralsReceived.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No referrals received</p>
              </CardContent>
            </Card>
          ) : (
            referralsReceived.map((referral) => (
              <Card key={referral.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">From: {getDoctorName(referral.fromDoctorId)}</h3>
                        <Badge variant={getStatusBadge(referral.status)}>
                          {getReferralStatusLabel(referral.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-1">
                        <strong>Condition:</strong> {referral.condition}
                      </p>
                      {referral.patient.name && (
                        <p className="text-sm text-gray-600 mb-1">
                          Patient: {referral.patient.name}
                          {referral.patient.dob && `, DOB: ${referral.patient.dob}`}
                          {referral.patient.sex && `, ${referral.patient.sex}`}
                        </p>
                      )}
                      {referral.notes && (
                        <p className="text-sm text-gray-600 mb-2">{referral.notes}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatDateTime(referral.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(referral)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {referral.status === 'considering' && (
                        <Select
                          value={referral.status}
                          onValueChange={(value) => handleStatusChange(referral.id, value as ReferralStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accepted">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {referralsSent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No referrals sent</p>
              </CardContent>
            </Card>
          ) : (
            referralsSent.map((referral) => (
              <Card key={referral.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">To: {getDoctorName(referral.toDoctorId)}</h3>
                        <Badge variant={getStatusBadge(referral.status)}>
                          {getReferralStatusLabel(referral.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-1">
                        <strong>Condition:</strong> {referral.condition}
                      </p>
                      {referral.patient.name && (
                        <p className="text-sm text-gray-600 mb-1">
                          Patient: {referral.patient.name}
                          {referral.patient.dob && `, DOB: ${referral.patient.dob}`}
                          {referral.patient.sex && `, ${referral.patient.sex}`}
                        </p>
                      )}
                      {referral.notes && (
                        <p className="text-sm text-gray-600 mb-2">{referral.notes}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatDateTime(referral.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(referral)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      {selectedReferral && (
        <Dialog
          open={showDetailDialog}
          onOpenChange={(open) => {
            setShowDetailDialog(open);
            // Remove both referralId and tab params from URL when dialog closes
            // This ensures notifications always land users in the right view without leaving "stuck params"
            if (!open && (referralIdParam || tabParam)) {
              router.replace('/doctor/dashboard/referrals');
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Referral Details</DialogTitle>
              <DialogDescription>
                Referral from {getDoctorName(selectedReferral.fromDoctorId)} to {getDoctorName(selectedReferral.toDoctorId)}
              </DialogDescription>
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
                <Badge variant={getStatusBadge(selectedReferral.status)}>
                  {getReferralStatusLabel(selectedReferral.status)}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <Timeline records={timeline} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
