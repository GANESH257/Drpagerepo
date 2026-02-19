'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { Practice } from '@/types/practice';
import { Doctor } from '@/types';
import { getApprovalRequests } from '@/lib/storage/approvalStorage';
import { getApprovalTimeline, markUnderReview, decideAsAdmin } from '@/lib/services/approvalEngine';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError, NotFoundError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { ApprovalStatusBadge } from '@/components/shared/approvals/ApprovalStatusBadge';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { RequestedChangesRenderer } from '@/components/shared/approvals/RequestedChangesRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { practices } from '@/data/practices';
import { getCreatedPractices } from '@/lib/storage/practiceStorage';
import { doctors } from '@/data/doctors';
import { loadDoctorProfile } from '@/lib/doctorStorage';

interface ApprovalRequestDetailClientProps {
    requestId: string;
}

export function ApprovalRequestDetailClient({ requestId }: ApprovalRequestDetailClientProps) {
    const router = useRouter();

    const [request, setRequest] = useState<ApprovalRequest | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showUnderReviewDialog, setShowUnderReviewDialog] = useState(false);
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');
    const [underReviewNotes, setUnderReviewNotes] = useState('');

    useEffect(() => {
        try {
            const actor = getActorFromSession();
            assertAdmin(actor);

            // Load request
            const requests = getApprovalRequests();
            const foundRequest = requests.find(r => r.id === requestId);

            if (!foundRequest) {
                throw new NotFoundError('ApprovalRequest', requestId);
            }

            setRequest(foundRequest);

            // Load timeline
            const history = getApprovalTimeline(requestId);
            setTimeline(history);

            setIsLoading(false);
        } catch (error) {
            if (error instanceof AuthRequiredError) {
                router.push('/admin/login');
            } else if (error instanceof PermissionDeniedError) {
                router.push('/admin');
            } else if (error instanceof NotFoundError) {
                toast.error('Approval request not found');
                router.push('/admin/requests-v2');
            }
            setIsLoading(false);
        }
    }, [requestId, router]);

    const handleMarkUnderReview = async () => {
        if (!request) return;

        try {
            setIsSubmitting(true);
            const actor = getActorFromSession();
            markUnderReview(actor, request.id, underReviewNotes || undefined);
            toast.success('Request marked as under review');
            setShowUnderReviewDialog(false);
            // Reload request
            const requests = getApprovalRequests();
            const updated = requests.find(r => r.id === request.id);
            if (updated) {
                setRequest(updated);
                const history = getApprovalTimeline(request.id);
                setTimeline(history);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to mark as under review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (!request) return;

        try {
            setIsSubmitting(true);
            const actor = getActorFromSession();
            decideAsAdmin(actor, request.id, 'approve', {
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
            decideAsAdmin(actor, request.id, 'reject', {
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

    const getTargetDisplay = (): { type: 'practice' | 'doctor'; data: Practice | Doctor } | null => {
        if (!request) return null;

        const allPractices = [...practices, ...getCreatedPractices()];

        if (request.target?.practiceId) {
            const practice = allPractices.find(p => p.id === request.target.practiceId);
            return practice ? { type: 'practice', data: practice } : null;
        }

        if (request.target?.doctorId) {
            const doctor = loadDoctorProfile(request.target.doctorId) || doctors.find(d => d.id === request.target.doctorId);
            return doctor ? { type: 'doctor', data: doctor } : null;
        }

        return null;
    };

    const renderPayload = () => {
        if (!request) return null;

        return <RequestedChangesRenderer request={request} />;
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
                <Button onClick={() => router.push('/admin/requests-v2')} className="mt-4">
                    Back to Queue
                </Button>
            </div>
        );
    }

    const targetDisplay = getTargetDisplay();
    const canMarkUnderReview = request.status === 'submitted';
    const canApprove = request.approvals.admin.status === 'pending';
    const canReject = request.approvals.admin.status === 'pending';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeader
                    title="Approval Request Details"
                    description={`Request ID: ${request.id}`}
                />
                <Button variant="outline" onClick={() => router.push('/admin/requests-v2')}>
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
                            <Label className="text-gray-600">Last Updated</Label>
                            <p className="font-medium">{formatDateTime(request.updatedAt)}</p>
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
                        {targetDisplay && (
                            <div>
                                <Label className="text-gray-600">Target</Label>
                                <p className="font-medium">
                                    {targetDisplay.type === 'practice'
                                        ? (targetDisplay.data as Practice).name
                                        : (targetDisplay.data as Doctor).fullName}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dual Approval Status */}
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
                        {request.approvals.admin.notes && (
                            <p className="text-sm text-gray-600 mt-2">{request.approvals.admin.notes}</p>
                        )}
                    </div>

                    {request.approvals.practiceAdmin && (
                        <div>
                            <Label className="text-gray-600 mb-2 block">Practice Admin Approval</Label>
                            <div className="flex items-center gap-2">
                                <ApprovalStatusBadge status={request.approvals.practiceAdmin.status as any} />
                                {request.approvals.practiceAdmin.decidedAt && (
                                    <span className="text-sm text-gray-600">
                                        on {formatDateTime(request.approvals.practiceAdmin.decidedAt)}
                                    </span>
                                )}
                            </div>
                            {request.approvals.practiceAdmin.notes && (
                                <p className="text-sm text-gray-600 mt-2">{request.approvals.practiceAdmin.notes}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Requested Changes */}
            <Card>
                <CardHeader>
                    <CardTitle>Requested Changes</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderPayload()}
                </CardContent>
            </Card>

            {/* Admin Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        {canMarkUnderReview && (
                            <Dialog open={showUnderReviewDialog} onOpenChange={setShowUnderReviewDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Mark Under Review</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Mark Request Under Review</DialogTitle>
                                        <DialogDescription>
                                            Add optional notes about why this request is being reviewed.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="under-review-notes">Notes (optional)</Label>
                                            <Textarea
                                                id="under-review-notes"
                                                value={underReviewNotes}
                                                onChange={(e) => setUnderReviewNotes(e.target.value)}
                                                placeholder="Add notes about this review..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowUnderReviewDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleMarkUnderReview} disabled={isSubmitting}>
                                            {isSubmitting ? 'Processing...' : 'Mark Under Review'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {canApprove && (
                            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                                <DialogTrigger asChild>
                                    <Button>Approve</Button>
                                </DialogTrigger>
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
                                <DialogTrigger asChild>
                                    <Button variant="destructive">Reject</Button>
                                </DialogTrigger>
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
