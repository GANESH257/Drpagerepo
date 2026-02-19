'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { getApprovalRequests, getApprovalHistory } from '@/lib/storage/approvalStorage';
import { getApprovalTimeline, decideAsPracticeAdmin } from '@/lib/services/approvalEngine';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError, NotFoundError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { ApprovalStatusBadge } from '@/components/shared/approvals/ApprovalStatusBadge';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';

export default function PracticeAdminApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);
      
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Practice admin must have practiceId');
      }
      
      // Load request
      const requests = getApprovalRequests();
      const foundRequest = requests.find(r => r.id === requestId);
      
      if (!foundRequest) {
        throw new NotFoundError('ApprovalRequest', requestId);
      }
      
      // Verify this request is for this practice admin
      if (foundRequest.approvals.practiceAdmin?.practiceId !== actor.practiceId) {
        throw new PermissionDeniedError('This approval request is not for your practice');
      }
      
      setRequest(foundRequest);
      
      // Load timeline
      const history = getApprovalTimeline(requestId);
      setTimeline(history);
      
      setIsLoading(false);
    } catch (error) {
      if (error instanceof AuthRequiredError) {
        router.push('/join-us');
      } else if (error instanceof PermissionDeniedError || error instanceof NotFoundError) {
        toast.error(error.message);
        router.push('/doctor/dashboard/practice/approvals');
      }
      setIsLoading(false);
    }
  }, [requestId, router]);

  const handleApprove = async () => {
    if (!request) return;
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor') {
        throw new PermissionDeniedError('Must be a doctor');
      }
      
      decideAsPracticeAdmin(actor, request.id, 'approve', {
        notes: approveNotes || undefined,
      });
      toast.success('Request approved');
      setShowApproveDialog(false);
      setApproveNotes('');
      // Reload request
      const requests = getApprovalRequests();
      const updated = requests.find(r => r.id === request.id);
      if (updated) {
        setRequest(updated);
        const history = getApprovalTimeline(request.id);
        setTimeline(history);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!request || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor') {
        throw new PermissionDeniedError('Must be a doctor');
      }
      
      decideAsPracticeAdmin(actor, request.id, 'reject', {
        reason: rejectReason,
        notes: rejectNotes || undefined,
      });
      toast.success('Request rejected');
      setShowRejectDialog(false);
      setRejectReason('');
      setRejectNotes('');
      // Reload request
      const requests = getApprovalRequests();
      const updated = requests.find(r => r.id === request.id);
      if (updated) {
        setRequest(updated);
        const history = getApprovalTimeline(request.id);
        setTimeline(history);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Approval request not found</p>
        <Button onClick={() => router.push('/doctor/dashboard/practice/approvals')} className="mt-4">
          Back to Queue
        </Button>
      </div>
    );
  }

  const canApprove = request.approvals.practiceAdmin?.status === 'pending';
  const canReject = request.approvals.practiceAdmin?.status === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Approval Request Details"
          description={`Request ID: ${request.id}`}
        />
        <Button variant="outline" onClick={() => router.push('/doctor/dashboard/practice/approvals')}>
          Back to Queue
        </Button>
      </div>

      {/* Request Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Request Summary</CardTitle>
            <div className="flex gap-2">
              <ApprovalTypeBadge type={request.type} />
              <ApprovalStatusBadge status={request.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Submitted At</Label>
              <p className="font-medium">{formatDateTime(request.submittedAt)}</p>
            </div>
            <div>
              <Label className="text-gray-600">Submitted By</Label>
              <p className="font-medium">
                {request.submittedBy.role}
                {request.submittedBy.email && (
                  <span className="text-gray-600 ml-2">({request.submittedBy.email})</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Status */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-600 mb-2 block">Admin Approval</Label>
            <div className="flex items-center gap-2">
              <ApprovalStatusBadge status={request.approvals.admin.status as any} />
              {request.approvals.admin.decidedAt && (
                <span className="text-sm text-gray-600">
                  on {formatDateTime(request.approvals.admin.decidedAt)}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <Label className="text-gray-600 mb-2 block">Practice Admin Approval (Your Decision)</Label>
            <div className="flex items-center gap-2">
              <ApprovalStatusBadge status={request.approvals.practiceAdmin?.status as any} />
              {request.approvals.practiceAdmin?.decidedAt && (
                <span className="text-sm text-gray-600">
                  on {formatDateTime(request.approvals.practiceAdmin.decidedAt)}
                </span>
              )}
            </div>
            {request.approvals.practiceAdmin?.notes && (
              <p className="text-sm text-gray-600 mt-2">{request.approvals.practiceAdmin.notes}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requested Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Requested Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">
            {JSON.stringify(request.payload, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Actions */}
      {canApprove || canReject ? (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {canApprove && (
                <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                  <Button onClick={() => setShowApproveDialog(true)}>Approve</Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Request</DialogTitle>
                      <DialogDescription>
                        Approve this request. Add optional notes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="approve-notes">Notes (optional)</Label>
                        <Textarea
                          id="approve-notes"
                          value={approveNotes}
                          onChange={(e) => setApproveNotes(e.target.value)}
                          placeholder="Add approval notes..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApprove} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Approve'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {canReject && (
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>Reject</Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Request</DialogTitle>
                      <DialogDescription>
                        Reject this request. A reason is required.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reject-reason">Reason *</Label>
                        <Input
                          id="reject-reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="reject-notes">Notes (optional)</Label>
                        <Textarea
                          id="reject-notes"
                          value={rejectNotes}
                          onChange={(e) => setRejectNotes(e.target.value)}
                          placeholder="Add additional notes..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isSubmitting || !rejectReason.trim()}
                      >
                        {isSubmitting ? 'Processing...' : 'Reject'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline records={timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
