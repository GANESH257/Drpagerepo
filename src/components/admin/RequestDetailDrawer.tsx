'use client';

import { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminJoinRequest } from '@/lib/adminStorage';
import { approveJoinRequest, rejectJoinRequest } from '@/lib/api/join-requests';

interface RequestDetailDrawerProps {
  request: AdminJoinRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestUpdate: () => void;
}

export function RequestDetailDrawer({
  request,
  open,
  onOpenChange,
  onRequestUpdate,
}: RequestDetailDrawerProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    if (!request) return;
    try {
      setIsProcessing(true);
      await approveJoinRequest(request.id, notes || undefined);
      setShowAcceptDialog(false);
      setNotes('');
      onRequestUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      setIsProcessing(true);
      await rejectJoinRequest(request.id, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason('');
      onRequestUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!request) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-foreground" style={{ color: 'var(--aip-teal)' }}>
              Membership Request Details
            </SheetTitle>
            <SheetDescription>
              Review applicant information and make a decision
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <StatusBadge status={request.status} label={request.status === 'approved' ? 'Accepted' : undefined} />
            </div>

            {/* Applicant Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Applicant Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{request.applicant.fullName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Credentials</Label>
                  <p className="font-medium">{request.applicant.credentials}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Specialty</Label>
                  <p className="font-medium">{request.applicant.specialty}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{request.applicant.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{request.applicant.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="font-medium">{request.applicant.city}, {request.applicant.state}</p>
                </div>
              </div>

              {request.applicant.practiceName && (
                <div>
                  <Label className="text-xs text-muted-foreground">Practice Name</Label>
                  <p className="font-medium">{request.applicant.practiceName}</p>
                </div>
              )}

              {request.applicant.website && (
                <div>
                  <Label className="text-xs text-muted-foreground">Website</Label>
                  <a
                    href={request.applicant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--aip-teal)] hover:underline"
                  >
                    {request.applicant.website}
                  </a>
                </div>
              )}

              {request.applicant.messageToAdmin && (
                <div>
                  <Label className="text-xs text-muted-foreground">Message to Admin</Label>
                  <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">
                    {request.applicant.messageToAdmin}
                  </p>
                </div>
              )}
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-foreground">Plan Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Plan</Label>
                  <p className="font-medium capitalize">{request.plan.planId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Billing Cycle</Label>
                  <p className="font-medium capitalize">{request.plan.billingCycle}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-foreground">Payment Method</h3>
              <div>
                <Label className="text-xs text-muted-foreground">Method</Label>
                <p className="font-medium capitalize">{request.paymentMethod}</p>
              </div>
              {request.paymentDetails?.cardName && (
                <div>
                  <Label className="text-xs text-muted-foreground">Card Name</Label>
                  <p className="font-medium">{request.paymentDetails.cardName}</p>
                </div>
              )}
              {request.paymentDetails?.billingZip && (
                <div>
                  <Label className="text-xs text-muted-foreground">Billing ZIP</Label>
                  <p className="font-medium">{request.paymentDetails.billingZip}</p>
                </div>
              )}
            </div>

            {/* Submission Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-foreground">Submission Details</h3>
              <div>
                <Label className="text-xs text-muted-foreground">Submitted At</Label>
                <p className="font-medium">{formatDate(request.submittedAt)}</p>
              </div>
              {request.decidedAt && (
                <div>
                  <Label className="text-xs text-muted-foreground">Decided At</Label>
                  <p className="font-medium">{formatDate(request.decidedAt)}</p>
                </div>
              )}
              {request.decidedBy && (
                <div>
                  <Label className="text-xs text-muted-foreground">Decided By</Label>
                  <p className="font-medium">{request.decidedBy}</p>
                </div>
              )}
              {request.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{request.notes}</p>
                </div>
              )}
              {request.rejectionReason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 rounded-lg text-red-700">
                    {request.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Nothing has been charged yet. Payment will only be processed after approval.
              </p>
            </div>

            {/* Actions */}
            {(request.status === 'submitted' || request.status === 'under_review') && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowAcceptDialog(true)}
                  className="flex-1 bg-gradient-to-br from-[var(--aip-teal)] to-[var(--aip-navy)] text-white hover:opacity-90"
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept Request
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  variant="destructive"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Request
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Accept Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Membership Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the membership request for {request?.applicant.fullName}. 
              You can add optional notes below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNotes('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept} className="bg-gradient-to-br from-[var(--aip-teal)] to-[var(--aip-navy)] text-white hover:opacity-90">
              Accept Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Membership Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject the membership request for {request?.applicant.fullName}. 
              You can provide a reason below (optional but recommended).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
