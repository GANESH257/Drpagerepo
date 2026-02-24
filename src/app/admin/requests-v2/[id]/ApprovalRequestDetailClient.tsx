'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApprovalRequest } from '@/types/approvals';
import { Practice } from '@/types/practice';
import { Doctor } from '@/types';
import { getApprovalRequest as getApprovalRequestAPI, approveRequest, rejectRequest, updateApprovalRequest } from '@/lib/api/approval-requests';
import { transformApprovalRequestFromAPI } from '@/lib/api/approval-requests-transform';
import { getApprovalTimeline } from '@/lib/services/approvalEngine';
import { getActorFromSession, assertAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError, NotFoundError } from '@/lib/services/errors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApprovalTypeBadge } from '@/components/shared/approvals/ApprovalTypeBadge';
import { Timeline } from '@/components/shared/approvals/Timeline';
import { RequestedChangesRenderer } from '@/components/shared/approvals/RequestedChangesRenderer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/dateUtils';
import { toast } from '@/lib/toast';
import { getAllPractices } from '@/lib/services/practiceDirectoryService';
import { getAllDoctorsArray } from '@/lib/api/doctors';
import { getToken } from '@/lib/api/config';

interface ApprovalRequestDetailClientProps {
    requestId: string;
    /** Back link (e.g. /admin/approvals when used from Membership Approvals) */
    backHref?: string;
}

const DEFAULT_BACK_HREF = '/admin/requests-v2';

export function ApprovalRequestDetailClient({ requestId, backHref = DEFAULT_BACK_HREF }: ApprovalRequestDetailClientProps) {
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
    const [practices, setPractices] = useState<Practice[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    useEffect(() => {
        async function loadRequest() {
            try {
                const actor = getActorFromSession();
                assertAdmin(actor);

                const token = getToken();
                // Load all data from API
                const [apiRequest, allPractices, allDoctorsRaw] = await Promise.all([
                    getApprovalRequestAPI(requestId),
                    getAllPractices(),
                    token ? getAllDoctorsArray(token) : Promise.resolve([]),
                ]);
                const allDoctors = Array.isArray(allDoctorsRaw) ? allDoctorsRaw : [];

                const transformedRequest = transformApprovalRequestFromAPI(apiRequest);
                setRequest(transformedRequest);
                setPractices(allPractices);
                setDoctors(allDoctors);

                // Load timeline from API
                const history = await getApprovalTimeline(requestId);
                setTimeline(history);

                setIsLoading(false);
            } catch (error) {
                if (error instanceof AuthRequiredError) {
                    router.push('/admin/login');
                } else if (error instanceof PermissionDeniedError) {
                    router.push('/admin');
                } else {
                    toast.error('Approval request not found');
                    router.push(backHref);
                }
                setIsLoading(false);
            }
        }
        loadRequest();
    }, [requestId, router]);

    const handleMarkUnderReview = async () => {
        if (!request) return;

        try {
            setIsSubmitting(true);
            // Update approval request with notes (marks as under review)
            await updateApprovalRequest(request.id, {
                payload: request.payload,
            });
            toast.success('Request marked as under review');
            setShowUnderReviewDialog(false);
            // Reload request
            const apiRequest = await getApprovalRequestAPI(request.id);
            const updated = transformApprovalRequestFromAPI(apiRequest);
            setRequest(updated);
            // Update timeline
            const history = [];
            if (updated.submittedAt) {
                history.push({
                    action: 'submitted',
                    at: updated.submittedAt,
                    by: updated.submittedBy,
                });
            }
            if (updated.approvals.admin.decidedAt) {
                history.push({
                    action: updated.approvals.admin.status === 'approved' ? 'admin_approved' : 'admin_rejected',
                    at: updated.approvals.admin.decidedAt,
                    by: { role: 'admin' },
                    notes: updated.approvals.admin.notes,
                });
            }
            setTimeline(history);
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
            // Get the updated request from the approval response
            const approvedRequest = await approveRequest(request.id, approveNotes || undefined);
            console.log('Approval response:', {
                id: approvedRequest.id,
                admin_status: approvedRequest.admin_status,
                practice_admin_status: approvedRequest.practice_admin_status,
                admin_reviewed_at: approvedRequest.admin_reviewed_at
            });
            
            toast.success('Request approved successfully!');
            setShowApproveDialog(false);
            setApproveNotes('');
            
            // Transform the response immediately
            const updated = transformApprovalRequestFromAPI(approvedRequest);
            console.log('Transformed from approval response:', {
                status: updated.status,
                adminStatus: updated.approvals.admin.status,
                practiceAdminStatus: updated.approvals.practiceAdmin?.status
            });
            
            // Update state immediately with the response (this is the source of truth)
            setRequest(updated);
            
            // Update timeline
            try {
                const history = await getApprovalTimeline(request.id);
                setTimeline(history);
            } catch (timelineError) {
                console.error('Error loading timeline:', timelineError);
            }
            
        } catch (error: any) {
            console.error('Approval error:', error);
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
            await rejectRequest(request.id, rejectReason);
            toast.success('Request rejected');
            setShowRejectDialog(false);
            setRejectReason('');
            setRejectNotes('');
            // Reload request
            const apiRequest = await getApprovalRequestAPI(request.id);
            const updated = transformApprovalRequestFromAPI(apiRequest);
            setRequest(updated);
            const history = await getApprovalTimeline(request.id);
            setTimeline(history);
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTargetDisplay = (): { type: 'practice' | 'doctor'; data: Practice | Doctor } | null => {
        if (!request) return null;

        const allPractices = practices;

        if (request.target?.practiceId) {
            const practice = allPractices.find(p => p.id === request.target.practiceId);
            return practice ? { type: 'practice', data: practice } : null;
        }

        if (request.target?.doctorId) {
            const doctor = doctors.find(d => d.id === request.target.doctorId);
            return doctor ? { type: 'doctor', data: doctor } : null;
        }

        return null;
    };

    const renderPayload = () => {
        if (!request) return null;

        return <RequestedChangesRenderer request={request} />;
    };

    const renderApprovalEffects = () => {
        if (!request) return null;

        const effects: string[] = [];

        switch (request.type) {
            case 'new_practice_with_admin_doctor':
                effects.push('A new practice will be created with the provided details');
                effects.push('A doctor profile will be created for the applicant');
                effects.push('The doctor will be assigned as Practice Admin');
                effects.push('The practice will be added to the directory');
                break;
            case 'doctor_join_practice':
                effects.push('The doctor will be added to the practice roster');
                effects.push('The doctor\'s practiceId will be updated');
                effects.push('The practice\'s doctorIds array will be updated');
                effects.push('A notification will be sent to the doctor');
                break;
            case 'practice_edit_request':
                effects.push('Practice information will be updated with the requested changes');
                effects.push('Changes will be reflected immediately in the directory');
                break;
            case 'practice_admin_practice_profile_edit':
                effects.push('Practice profile (name, description, phone, website, services, insurance) will be updated');
                effects.push('Changes will be reflected in the directory');
                break;
            case 'practice_admin_practice_locations_edit':
                effects.push('All practice locations will be replaced with the submitted list');
                effects.push('Changes will be reflected in the practice profile');
                break;
            case 'practice_doctor_add_request':
                effects.push('The invited doctor will be added to the practice');
                effects.push('The practice roster will be updated');
                effects.push('A notification will be sent to the doctor');
                break;
            case 'practice_doctor_remove_request':
                effects.push('The doctor will be removed from the practice roster');
                effects.push('The doctor\'s practiceId will be cleared');
                effects.push('The practice\'s doctorIds array will be updated');
                break;
            case 'practice_location_add_request':
                effects.push('A new location will be added to the practice');
                effects.push('The practice locations array will be updated');
                break;
            case 'practice_location_edit_request':
                effects.push('The specified location will be updated');
                effects.push('Changes will be reflected in the practice profile');
                break;
            case 'practice_location_remove_request':
                effects.push('The specified location will be removed from the practice');
                effects.push('The practice locations array will be updated');
                break;
            case 'practice_insurance_services_change_request':
                effects.push('Practice insurance and services will be updated');
                effects.push('Changes will be reflected in search filters');
                break;
            default:
                effects.push('Approval will apply the requested changes');
        }

        return (
            <ul className="list-disc list-inside space-y-2 text-sm">
                {effects.map((effect, idx) => (
                    <li key={idx} className="text-muted-foreground">{effect}</li>
                ))}
            </ul>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--aip-teal)' }} />
                    <p className="text-muted-foreground">Loading approval request...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Approval request not found</p>
                <Button onClick={() => router.push(backHref)} className="mt-4">
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
        <div className="space-y-8 max-w-4xl">
            {/* Header with back */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2 text-muted-foreground hover:text-[var(--aip-teal)]"
                        onClick={() => router.push(backHref)}
                    >
                        ← Back to Queue
                    </Button>
                    <SectionHeader
                        title="Approval Request Details"
                        description={`Request ID: ${request.id}`}
                    />
                </div>
            </div>

            {/* Request Summary */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">Request Summary</h3>
                        <div className="flex gap-2">
                            <ApprovalTypeBadge type={request.type} />
                            <StatusBadge status={request.status} />
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Submitted At</Label>
                            <p className="font-medium">{formatDateTime(request.submittedAt)}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Last Updated</Label>
                            <p className="font-medium">{formatDateTime(request.updatedAt)}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Submitted By</Label>
                            <p className="font-medium">
                                {request.submittedBy.role}
                                {request.submittedBy.email && (
                                    <span className="text-muted-foreground ml-2">({request.submittedBy.email})</span>
                                )}
                            </p>
                        </div>
                        {targetDisplay && (
                            <div>
                                <Label className="text-muted-foreground">Target</Label>
                                <p className="font-medium">
                                    {targetDisplay.type === 'practice'
                                        ? (targetDisplay.data as Practice).name
                                        : (targetDisplay.data as Doctor).fullName}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dual Approval Status */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Approval Status</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <Label className="text-muted-foreground mb-2 block">Admin Approval</Label>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={request.approvals.admin.status as string} />
                            {request.approvals.admin.decidedAt && (
                                <span className="text-sm text-muted-foreground">
                                    on {formatDateTime(request.approvals.admin.decidedAt)}
                                </span>
                            )}
                        </div>
                        {request.approvals.admin.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{request.approvals.admin.notes}</p>
                        )}
                    </div>

                    {request.approvals.practiceAdmin && (
                        <div>
                            <Label className="text-muted-foreground mb-2 block">Practice Admin Approval</Label>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={request.approvals.practiceAdmin.status as string} />
                                {request.approvals.practiceAdmin.decidedAt && (
                                    <span className="text-sm text-muted-foreground">
                                        on {formatDateTime(request.approvals.practiceAdmin.decidedAt)}
                                    </span>
                                )}
                            </div>
                            {request.approvals.practiceAdmin.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{request.approvals.practiceAdmin.notes}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Requested Changes */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Requested Changes</h3>
                </div>
                <div className="p-6">
                    {renderPayload()}
                </div>
            </div>

            {/* What Happens When Approved */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">What Happens When Approved</h3>
                </div>
                <div className="p-6">
                    {renderApprovalEffects()}
                </div>
            </div>

            {/* Admin Actions */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Actions</h3>
                </div>
                <div className="p-6 pt-6">
                    <div className="flex flex-wrap gap-3">
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
                                    <Button className="text-white border-0" style={{ background: 'linear-gradient(135deg, var(--aip-teal), var(--aip-navy))' }}>Approve</Button>
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
                </div>
            </div>

            {/* Timeline */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
                </div>
                <div className="p-6">
                    <Timeline records={timeline} />
                </div>
            </div>
        </div>
    );
}
