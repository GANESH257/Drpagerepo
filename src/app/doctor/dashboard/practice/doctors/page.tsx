'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Doctor } from '@/types';
import { Practice } from '@/types/practice';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { addPracticeInvitation } from '@/lib/storage/invitationStorage';
import { makeId, nowISO } from '@/lib/services/id';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { practices } from '@/data/practices';
import { getCreatedPractices, mergePractices } from '@/lib/storage/practiceStorage';
import { doctors } from '@/data/doctors';
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
import { UserPlus, UserMinus } from 'lucide-react';

export default function PracticeRosterPage() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [practiceDoctors, setPracticeDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);
      
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Practice admin must have practiceId');
      }
      
      // Load practice
      const allPractices = mergePractices([...practices, ...getCreatedPractices()]);
      const foundPractice = allPractices.find(p => p.id === actor.practiceId);
      
      if (!foundPractice) {
        throw new Error('Practice not found');
      }
      
      setPractice(foundPractice);
      
      // Load practice doctors
      const doctorsInPractice = doctors.filter(d => d.practiceId === foundPractice.id);
      setPracticeDoctors(doctorsInPractice);
      
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
      
      // Create invitation
      const invitationId = makeId('inv');
      addPracticeInvitation({
        id: invitationId,
        practiceId: practice.id,
        email: inviteEmail.trim(),
        invitedAt: nowISO(),
        invitedByDoctorId: actor.doctorId,
        status: 'sent',
      });
      
      // Create approval request
      submitApprovalRequest(actor, {
        type: 'practice_doctor_add_request',
        payload: {
          invitationId,
          email: inviteEmail.trim(),
          message: inviteMessage || undefined,
        },
        target: {
          practiceId: practice.id,
          invitedDoctorEmail: inviteEmail.trim(),
        },
      });
      
      toast.success('Invitation sent and approval request submitted');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!practice) return;
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      submitApprovalRequest(actor, {
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
                  {isSubmitting ? 'Submitting...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Doctors List */}
      {practiceDoctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No doctors in this practice yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practiceDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{doctor.fullName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{doctor.specialty}</p>
                  </div>
                  <Badge variant={doctor.roleInPractice === 'practice_admin' ? 'default' : 'outline'}>
                    {doctor.roleInPractice === 'practice_admin' ? 'Practice Admin' : 'Doctor'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {doctor.roleInPractice !== 'practice_admin' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove Doctor
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
