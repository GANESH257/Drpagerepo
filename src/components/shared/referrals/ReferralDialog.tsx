'use client';

import { useState } from 'react';
import { Doctor } from '@/types';
import { getActorFromSession } from '@/lib/services/permissionService';
import { createReferral } from '@/lib/services/referralEngine';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { Send } from 'lucide-react';

interface ReferralDialogProps {
    doctor: Doctor;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ReferralDialog({ doctor, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: ReferralDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const onOpenChange = setControlledOpen || setInternalOpen;

    const [form, setForm] = useState({
        patientName: '',
        patientDob: '',
        patientSex: '' as 'male' | 'female' | 'other' | '',
        condition: '',
        notes: '',
    });

    const handleSubmit = async () => {
        if (!form.condition.trim()) {
            toast.error('Please provide a condition');
            return;
        }

        try {
            setIsSubmitting(true);
            const actor = getActorFromSession();
            createReferral(actor, {
                toDoctorId: doctor.id,
                patient: {
                    name: form.patientName || undefined,
                    dob: form.patientDob || undefined,
                    sex: form.patientSex || undefined,
                },
                condition: form.condition,
                notes: form.notes || undefined,
            });

            toast.success('Referral sent successfully');
            onOpenChange(false);
            setForm({
                patientName: '',
                patientDob: '',
                patientSex: '',
                condition: '',
                notes: '',
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send referral');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Referral</DialogTitle>
                    <DialogDescription>
                        Send a referral to {doctor.fullName}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="condition">Condition *</Label>
                        <Textarea
                            id="condition"
                            value={form.condition}
                            onChange={(e) => setForm({ ...form, condition: e.target.value })}
                            placeholder="Describe the condition or reason for referral..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="patient-name">Name</Label>
                            <Input
                                id="patient-name"
                                value={form.patientName}
                                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                                placeholder="Patient Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient-dob">DOB</Label>
                            <Input
                                id="patient-dob"
                                value={form.patientDob}
                                onChange={(e) => setForm({ ...form, patientDob: e.target.value })}
                                placeholder="MM/DD/YYYY"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient-sex">Sex</Label>
                            <Select
                                value={form.patientSex}
                                onValueChange={(value) => setForm({ ...form, patientSex: value as any })}
                            >
                                <SelectTrigger id="patient-sex">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referral-notes">Notes (optional)</Label>
                        <Textarea
                            id="referral-notes"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Additional notes..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !form.condition.trim()}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Referral'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
