'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Doctor } from '@/types';
import { Practice } from '@/types/practice';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { getPracticeInvitations as getPracticeInvitationsAPI, createPracticeInvitation } from '@/lib/api/practices';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { getAllPracticesForAdmin, getDoctorsByPractice } from '@/lib/adminHelpers';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/lib/toast';
import { UserPlus, UserMinus, Copy, Mail, ExternalLink, Phone } from 'lucide-react';
import { getDoctorProfileUrl } from '@/lib/doctorProfileUrl';
import { PracticeInvitation } from '@/types/invitations';
import { getMembershipPlans } from '@/lib/api/membership-plans';

export default function PracticeRosterPage() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [practiceDoctors, setPracticeDoctors] = useState<Doctor[]>([]);
  const [invitations, setInvitations] = useState<PracticeInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedInvitation, setLastCreatedInvitation] = useState<PracticeInvitation | null>(null);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [membershipPlans, setMembershipPlans] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const actor = getActorFromSession();
        assertPracticeAdmin(actor);
        
        if (actor.kind !== 'doctor' || !actor.practiceId) {
          throw new PermissionDeniedError('Practice admin must have practiceId');
        }
        
        // Load practice using helper
        const allPractices = await getAllPracticesForAdmin();
        const foundPractice = allPractices.find(p => p.id === actor.practiceId);
        
        if (!foundPractice) {
          throw new Error('Practice not found');
        }
        
        setPractice(foundPractice);
        
        // Load practice doctors using helper
        const doctorsInPractice = await getDoctorsByPractice(foundPractice.id);
        setPracticeDoctors(doctorsInPractice);
        
        // Load invitations from API
        const apiInvitations = await getPracticeInvitationsAPI(foundPractice.id);
        const practiceInvitations = (Array.isArray(apiInvitations) ? apiInvitations : []).map((inv: any) => ({
          id: inv.id,
          practiceId: inv.practice_id ?? inv.practiceId,
          email: inv.email,
          invitedAt: inv.created_at ?? inv.invitedAt,
          invitedByDoctorId: inv.invited_by ?? inv.invitedByDoctorId,
          status: (inv.status ?? 'sent') as 'sent' | 'accepted' | 'expired' | 'revoked',
          invitationLink: inv.invitation_link ?? (inv.token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join-us/application?invitation=${inv.token}` : undefined),
        }));
        setInvitations(practiceInvitations);
        
        // Load membership plans from API for plan display
        try {
          const apiPlans = await getMembershipPlans();
          setMembershipPlans(Array.isArray(apiPlans) ? apiPlans.map((p) => ({ id: p.id, name: p.name })) : []);
        } catch {
          setMembershipPlans([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AuthRequiredError) {
          router.push('/join-us');
        } else if (error instanceof PermissionDeniedError) {
          router.push('/doctor/dashboard');
        }
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleInviteDoctor = async () => {
    if (!practice || !inviteEmail.trim()) {
      toast.error('Please provide an email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      const created = await createPracticeInvitation(practice.id, {
        email: inviteEmail.trim(),
        message: inviteMessage.trim() || undefined,
      });
      const newInvitation: PracticeInvitation = {
        id: created.id,
        practiceId: created.practice_id ?? practice.id,
        email: created.email,
        invitedAt: created.created_at ?? new Date().toISOString(),
        invitedByDoctorId: created.invited_by ?? actor.doctorId,
        status: (created.status ?? 'sent') as 'sent' | 'accepted' | 'expired' | 'revoked',
        invitationLink: created.invitation_link ?? (created.token ? `${window.location.origin}/join-us/application?invitation=${created.token}` : undefined),
      };
      
      setInvitations([newInvitation, ...invitations]);
      setLastCreatedInvitation(newInvitation);
      
      toast.success('Invitation created');
      // Don't close dialog yet - show invitation link
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInvitationLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!practice) return;
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      await submitApprovalRequest(actor, {
        type: 'practice_doctor_remove_request',
        payload: {},
        target: {
          practiceId: practice.id,
          doctorId,
        },
      });
      
      toast.success('Remove request submitted. Waiting for admin approval.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit remove request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roster...</p>
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
        title="Practice Roster"
        description={`Manage doctors in ${practice.name}`}
        actions={
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Doctor to Practice</DialogTitle>
                <DialogDescription>
                  Invite a doctor to join your practice. This will create an approval request.
                </DialogDescription>
              </DialogHeader>
              {lastCreatedInvitation ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">Invitation Created Successfully!</p>
                    <p className="text-xs text-green-700 mb-3">
                      Share this link with the doctor. They can use it to sign up with the practice preselected.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={lastCreatedInvitation.invitationLink || ''}
                        readOnly
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => lastCreatedInvitation.invitationLink && handleCopyInvitationLink(lastCreatedInvitation.invitationLink)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      setShowInviteDialog(false);
                      setLastCreatedInvitation(null);
                      setInviteEmail('');
                      setInviteMessage('');
                    }}>
                      Done
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invite-email">Email *</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="doctor@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-message">Message (optional)</Label>
                      <Textarea
                        id="invite-message"
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Optional invitation message..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteDoctor} disabled={isSubmitting || !inviteEmail.trim()}>
                      {isSubmitting ? 'Submitting...' : 'Create Invitation'}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      {/* Pending Invitations */}
      {invitations.filter(inv => inv.status === 'sent').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations
                .filter(inv => inv.status === 'sent')
                .map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent {new Date(invitation.invitedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {invitation.invitationLink && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyInvitationLink(invitation.invitationLink!)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(invitation.invitationLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      {practiceDoctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No doctors in this practice yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practiceDoctors.map((doctor) => {
            const d = doctor as { planId?: string; plan_id?: string; membership_plan_id?: string };
            const planId = d.planId ?? d.plan_id ?? d.membership_plan_id;
            const planName = planId ? membershipPlans.find((p) => p.id === planId)?.name ?? planId : null;

            return (
              <Card key={doctor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{doctor.specialty}</p>
                    </div>
                    <Badge variant={doctor.roleInPractice === 'practice_admin' ? 'default' : 'outline'}>
                      {doctor.roleInPractice === 'practice_admin' ? 'Practice Admin' : 'Doctor'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-1.5 text-sm">
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    )}
                    {doctor.locations?.[0]?.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{doctor.locations[0].phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Membership plan from API */}
                  {planName && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Membership:</span>
                        <Badge variant="default" className="text-xs">
                          {planName}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(getDoctorProfileUrl(doctor))}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Profile
                    </Button>
                    {doctor.roleInPractice !== 'practice_admin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <UserMinus className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Doctor from Practice?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will submit a removal request that requires admin approval. The doctor will remain in the practice until approved.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveDoctor(doctor.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
