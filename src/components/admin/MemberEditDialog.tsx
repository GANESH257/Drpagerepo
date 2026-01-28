'use client';

import { useState, useEffect } from 'react';
import { Save, Key, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Doctor, Location, Insurance } from '@/types';
import { saveDoctorOverride } from '@/lib/memberStorage';
import { resetPassword, setPassword } from '@/lib/passwordUtils';
import { departments } from '@/data/departments';

interface MemberEditDialogProps {
  doctor: Doctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function MemberEditDialog({ doctor, open, onOpenChange, onSave }: MemberEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Doctor>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);

  useEffect(() => {
    if (open && doctor) {
      setFormData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        credentials: doctor.credentials,
        email: doctor.email,
        specialty: doctor.specialty,
        specialties: doctor.specialties || [doctor.specialty],
        bio: doctor.bio,
        about: doctor.about,
        verified: doctor.verified,
        featured: doctor.featured,
        acceptsNewPatients: doctor.acceptsNewPatients,
        locations: doctor.locations || [],
        insurance: doctor.insurance || [],
      });
    }
  }, [open, doctor]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update fullName based on firstName and lastName
      const fullName = `${formData.firstName} ${formData.lastName}, ${formData.credentials}`;
      
      const updated: Partial<Doctor> = {
        ...formData,
        fullName,
      };

      saveDoctorOverride(doctor.id, updated);
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving doctor:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordResetClick = () => {
    setIsPasswordDialogOpen(true);
    setNewPassword(null);
    setCustomPassword('');
    setUseCustomPassword(false);
  };

  const handlePasswordResetConfirm = async () => {
    if (!doctor.email) return;

    try {
      let password: string;
      if (useCustomPassword && customPassword) {
        password = customPassword;
        await setPassword(doctor.email, password);
      } else {
        password = await resetPassword(doctor.email);
      }
      setNewPassword(password);
      setCustomPassword('');
      setUseCustomPassword(false);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...(formData.locations || []),
        {
          name: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
        },
      ],
    });
  };

  const updateLocation = (index: number, field: keyof Location, value: string) => {
    const locations = [...(formData.locations || [])];
    locations[index] = { ...locations[index], [field]: value };
    setFormData({ ...formData, locations });
  };

  const removeLocation = (index: number) => {
    const locations = formData.locations?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, locations });
  };

  const addInsurance = () => {
    setFormData({
      ...formData,
      insurance: [
        ...(formData.insurance || []),
        { name: '', slug: '' },
      ],
    });
  };

  const updateInsurance = (index: number, field: 'name' | 'slug', value: string) => {
    const insurance = [...(formData.insurance || [])];
    insurance[index] = { ...insurance[index], [field]: value };
    // Auto-generate slug from name if name is being updated
    if (field === 'name') {
      insurance[index].slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    setFormData({ ...formData, insurance });
  };

  const removeInsurance = (index: number) => {
    const insurance = formData.insurance?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, insurance });
  };

  const addSpecialty = () => {
    setFormData({
      ...formData,
      specialties: [...(formData.specialties || []), ''],
    });
  };

  const updateSpecialty = (index: number, value: string) => {
    const specialties = [...(formData.specialties || [])];
    specialties[index] = value;
    setFormData({ ...formData, specialties });
  };

  const removeSpecialty = (index: number) => {
    const specialties = formData.specialties?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, specialties });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor: {doctor.firstName} {doctor.lastName}</DialogTitle>
            <DialogDescription>
              Update doctor information, credentials, and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-brand-dark-blue">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credentials">Credentials *</Label>
                  <Input
                    id="credentials"
                    value={formData.credentials || ''}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    placeholder="M.D., D.O., etc."
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-brand-dark-blue">Professional Information</h3>
              <div>
                <Label htmlFor="specialty">Primary Specialty *</Label>
                <Input
                  id="specialty"
                  value={formData.specialty || ''}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Additional Specialties</Label>
                  <Button type="button" onClick={addSpecialty} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.specialties?.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={spec}
                        onChange={(e) => updateSpecialty(index, e.target.value)}
                        placeholder="Specialty name..."
                      />
                      <Button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        variant="ghost"
                        size="icon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="about">About (Extended)</Label>
                <Textarea
                  id="about"
                  value={formData.about || ''}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  rows={5}
                />
              </div>
            </div>

            {/* Status Toggles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-brand-dark-blue">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="verified">Verified</Label>
                    <p className="text-sm text-muted-foreground">Show verified badge</p>
                  </div>
                  <Switch
                    id="verified"
                    checked={formData.verified || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured">Featured</Label>
                    <p className="text-sm text-muted-foreground">Show in featured section</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="acceptsNewPatients">Accepts New Patients</Label>
                    <p className="text-sm text-muted-foreground">Currently accepting new patients</p>
                  </div>
                  <Switch
                    id="acceptsNewPatients"
                    checked={formData.acceptsNewPatients || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptsNewPatients: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Password Management */}
            <div className="space-y-4">
              <h3 className="font-semibold text-brand-dark-blue">Password</h3>
              <Button onClick={handlePasswordResetClick} variant="outline" className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-brand-dark-blue">Locations</h3>
                <Button type="button" onClick={addLocation} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
              <div className="space-y-4">
                {formData.locations?.map((location, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Location {index + 1}</Label>
                      <Button
                        type="button"
                        onClick={() => removeLocation(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Location name"
                        value={location.name}
                        onChange={(e) => updateLocation(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Phone"
                        value={location.phone}
                        onChange={(e) => updateLocation(index, 'phone', e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Address"
                      value={location.address}
                      onChange={(e) => updateLocation(index, 'address', e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="City"
                        value={location.city}
                        onChange={(e) => updateLocation(index, 'city', e.target.value)}
                      />
                      <Input
                        placeholder="State"
                        value={location.state}
                        onChange={(e) => updateLocation(index, 'state', e.target.value)}
                      />
                      <Input
                        placeholder="ZIP"
                        value={location.zip}
                        onChange={(e) => updateLocation(index, 'zip', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-brand-dark-blue">Insurance</h3>
                <Button type="button" onClick={addInsurance} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Insurance
                </Button>
              </div>
              <div className="space-y-2">
                {formData.insurance?.map((ins, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Insurance name"
                      value={ins.name}
                      onChange={(e) => updateInsurance(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Slug"
                      value={ins.slug}
                      onChange={(e) => updateInsurance(index, 'slug', e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => removeInsurance(index)}
                      variant="ghost"
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="gradient" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              {newPassword ? (
                <div className="space-y-3">
                  <p>The password has been reset. Please copy this password and share it with the doctor securely.</p>
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {newPassword}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This password will only be shown once. Make sure to save it securely.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useCustom"
                      checked={useCustomPassword}
                      onCheckedChange={setUseCustomPassword}
                    />
                    <Label htmlFor="useCustom">Use custom password</Label>
                  </div>
                  {useCustomPassword && (
                    <Input
                      type="password"
                      placeholder="Enter custom password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                    />
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {newPassword ? 'Close' : 'Cancel'}
            </AlertDialogCancel>
            {!newPassword && (
              <AlertDialogAction onClick={handlePasswordResetConfirm} disabled={useCustomPassword && !customPassword}>
                Reset Password
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
