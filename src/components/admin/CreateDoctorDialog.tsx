'use client';

import { useState, useEffect } from 'react';
import { Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createNewDoctor } from '@/lib/adminHelpers';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { Practice } from '@/types/practice';
import { toast } from '@/lib/toast';
import { setPassword } from '@/lib/passwordUtils';

interface CreateDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function CreateDoctorDialog({ open, onOpenChange, onSave }: CreateDoctorDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    credentials: '',
    email: '',
    specialty: '',
    bio: '',
    practiceId: '' as string | undefined,
    roleInPractice: 'doctor' as 'doctor' | 'practice_admin',
    password: '',
  });
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      async function loadPractices() {
        try {
          const allPractices = await getAllPracticesForAdmin();
          setPractices(allPractices);
        } catch (error) {
          console.error('Error loading practices:', error);
        }
      }
      loadPractices();
    }
  }, [open]);

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.credentials.trim() || 
        !formData.email.trim() || !formData.specialty.trim() || !formData.bio.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.password.trim()) {
      toast.error('Please set a password for the doctor');
      return;
    }

    setIsSaving(true);
    try {
      const doctorId = await createNewDoctor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        credentials: formData.credentials,
        email: formData.email,
        specialty: formData.specialty,
        bio: formData.bio,
        practiceId: formData.practiceId || undefined,
        roleInPractice: formData.practiceId ? formData.roleInPractice : undefined,
      });

      // Set password
      await setPassword(formData.email, formData.password);

      toast.success('Doctor created successfully');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        credentials: '',
        email: '',
        specialty: '',
        bio: '',
        practiceId: '',
        roleInPractice: 'doctor',
        password: '',
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating doctor:', error);
      toast.error('Failed to create doctor');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Doctor</DialogTitle>
          <DialogDescription>
            Create a new doctor profile. You can add more details after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-firstName">First Name *</Label>
                <Input
                  id="create-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="create-lastName">Last Name *</Label>
                <Input
                  id="create-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-credentials">Credentials *</Label>
                <Input
                  id="create-credentials"
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  placeholder="M.D."
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="doctor@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-password">Password *</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set initial password"
              />
            </div>
          </div>

          {/* Practice Assignment */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Practice Assignment (V2)</h3>
            <div>
              <Label htmlFor="create-practiceId">Practice</Label>
              <Select
                value={formData.practiceId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, practiceId: value === 'none' ? undefined : (value as string) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a practice (optional)..." />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Practice</SelectItem>
                    {practices.map((practice) => (
                      <SelectItem key={practice.id} value={practice.id}>
                        {practice.name}
                        {practice.address && ` - ${practice.address.city}, ${practice.address.state}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            {formData.practiceId && (
              <div>
                <Label htmlFor="create-roleInPractice">Role in Practice</Label>
                <Select
                  value={formData.roleInPractice}
                  onValueChange={(value: 'doctor' | 'practice_admin') => setFormData({ ...formData, roleInPractice: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="practice_admin">Practice Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Professional Information</h3>
            <div>
              <Label htmlFor="create-specialty">Primary Specialty *</Label>
              <Input
                id="create-specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Cardiology"
              />
            </div>
            <div>
              <Label htmlFor="create-bio">Bio *</Label>
              <Textarea
                id="create-bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Brief professional biography..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-br from-[var(--aip-teal)] to-[var(--aip-navy)] text-white hover:opacity-90" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Create Doctor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
