'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Referral, ReferralStatus } from '@/types/referrals';
import { getActorFromSession, assertDoctor } from '@/lib/services/permissionService';
import { getReferralsForDoctor, setReferralStatus, getReferralTimeline } from '@/lib/services/referralEngine';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { doctors } from '@/data/doctors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertDoctor(actor);
      
      if (actor.kind !== 'doctor' || !actor.doctorId) {
        throw new PermissionDeniedError('Must be a doctor');
      }
      
      const { referralsSent, referralsReceived } = getReferralsForDoctor(actor, actor.doctorId);
      setReferralsSent(referralsSent);
      setReferralsReceived(referralsReceived);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
      } else if (error instanceof PermissionDeniedError) {
        router.push('/doctor/dashboard');
      }
      setIsLoading(false);
    }
  }, [router]);

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
            const history = getReferralTimeline(actor, referral.id);
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
      
      setReferralStatus(actor, referralId, newStatus);
      toast.success(`Referral marked as ${newStatus}`);
      
      // Reload referrals
      const { referralsSent, referralsReceived } = getReferralsForDoctor(actor, actor.doctorId);
      setReferralsSent(referralsSent);
      setReferralsReceived(referralsReceived);
      
      // Reload timeline if dialog is open for this referral
      if (selectedReferral?.id === referralId && showDetailDialog) {
        try {
          const history = getReferralTimeline(actor, referralId);
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
        const history = getReferralTimeline(actor, referral.id);
        setTimeline(history);
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
    setShowDetailDialog(true);
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const variants: Record<ReferralStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'outline',
      attended: 'default',
      removed: 'destructive',
    };
    return variants[status];
  };

  const getDoctorName = (doctorId: string): string => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.fullName || doctorId;
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sent' | 'received')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Received ({referralsReceived.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({referralsSent.length})
          </TabsTrigger>
        </TabsList>

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
                          {referral.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-1">
                        <strong>Condition:</strong> {referral.condition}
                      </p>
                      {referral.patient.initials && (
                        <p className="text-sm text-gray-600 mb-1">
                          Patient: {referral.patient.initials}
                          {referral.patient.age && `, Age ${referral.patient.age}`}
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
                      {referral.status === 'new' && (
                        <Select
                          value={referral.status}
                          onValueChange={(value) => handleStatusChange(referral.id, value as ReferralStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attended">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Attended
                              </div>
                            </SelectItem>
                            <SelectItem value="removed">
                              <div className="flex items-center">
                                <XCircle className="h-4 w-4 mr-2" />
                                Mark Removed
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
                          {referral.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-1">
                        <strong>Condition:</strong> {referral.condition}
                      </p>
                      {referral.patient.initials && (
                        <p className="text-sm text-gray-600 mb-1">
                          Patient: {referral.patient.initials}
                          {referral.patient.age && `, Age ${referral.patient.age}`}
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
              {selectedReferral.patient.initials && (
                <div>
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <p className="text-gray-700">
                    Initials: {selectedReferral.patient.initials}
                    {selectedReferral.patient.age && `, Age: ${selectedReferral.patient.age}`}
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
                  {selectedReferral.status}
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
