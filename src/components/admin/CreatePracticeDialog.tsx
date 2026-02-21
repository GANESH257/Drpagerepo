'use client';

import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
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
import { Practice } from '@/types/practice';
import { createNewPractice } from '@/lib/adminHelpers';
import { toast } from '@/lib/toast';
import { slugify } from '@/lib/services/id';

interface CreatePracticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function CreatePracticeDialog({ open, onOpenChange, onSave }: CreatePracticeDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Practice name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setIsSaving(true);
    try {
      const practiceData: Partial<Practice> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
        address: formData.address,
        locations: [],
        specialties: [],
        doctorIds: [],
        services: [],
        insurance: [],
        slug: slugify(formData.name),
      };

      await createNewPractice(practiceData);
      toast.success('Practice created successfully');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA',
        },
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating practice:', error);
      toast.error('Failed to create practice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Practice
          </DialogTitle>
          <DialogDescription>
            Create a new practice. You can add locations, doctors, and other details after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark-blue">Basic Information</h3>
            <div>
              <Label htmlFor="create-name">Practice Name *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter practice name"
              />
            </div>
            <div>
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter practice description"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark-blue">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-phone">Phone *</Label>
                <Input
                  id="create-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="practice@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="create-website">Website</Label>
              <Input
                id="create-website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark-blue">Primary Address</h3>
            <div>
              <Label htmlFor="create-address-line1">Street Address</Label>
              <Input
                id="create-address-line1"
                value={formData.address.line1}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, line1: e.target.value },
                })}
                placeholder="123 Main St"
              />
            </div>
            <div>
              <Label htmlFor="create-address-line2">Address Line 2 (Optional)</Label>
              <Input
                id="create-address-line2"
                value={formData.address.line2}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, line2: e.target.value },
                })}
                placeholder="Suite 100"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="create-address-city">City</Label>
                <Input
                  id="create-address-city"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })}
                  placeholder="St. Louis"
                />
              </div>
              <div>
                <Label htmlFor="create-address-state">State</Label>
                <Input
                  id="create-address-state"
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value.toUpperCase() },
                  })}
                  placeholder="MO"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="create-address-zip">ZIP</Label>
                <Input
                  id="create-address-zip"
                  value={formData.address.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, zip: e.target.value },
                  })}
                  placeholder="63101"
                  maxLength={5}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.name.trim() || !formData.phone.trim()}>
            {isSaving ? 'Creating...' : 'Create Practice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
