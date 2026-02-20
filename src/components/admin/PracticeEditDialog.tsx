'use client';

import { useState, useEffect } from 'react';
import { Save, X, Plus, Building2 } from 'lucide-react';
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
import { Practice, PracticeLocation } from '@/types/practice';
import { Insurance } from '@/types';
import { savePracticeOverride } from '@/lib/storage/practiceStorage';
import { PracticeRosterSection } from './PracticeRosterSection';
import { makeId } from '@/lib/services/id';
import { geocodeZip } from '@/lib/services/geocodingService';
import { toast } from '@/lib/toast';

interface PracticeEditDialogProps {
  practice: Practice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function PracticeEditDialog({ practice, open, onOpenChange, onSave }: PracticeEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Practice>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open && practice) {
      setFormData({
        name: practice.name,
        description: practice.description || '',
        phone: practice.phone || '',
        email: practice.email || '',
        website: practice.website || '',
        address: practice.address || {
          line1: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA',
        },
        locations: practice.locations || [],
        services: practice.services || [],
        insurance: practice.insurance || [],
      });
    }
  }, [open, practice]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: Partial<Practice> = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      savePracticeOverride(practice.id, updated);
      toast.success('Practice updated successfully');
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving practice:', error);
      toast.error('Failed to save practice');
    } finally {
      setIsSaving(false);
    }
  };

  const addLocation = () => {
    const newLocation: PracticeLocation = {
      id: makeId('loc'),
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      lat: 0,
      lng: 0,
    };
    setFormData({
      ...formData,
      locations: [...(formData.locations || []), newLocation],
    });
  };

  const updateLocation = (index: number, field: keyof PracticeLocation, value: string | number) => {
    const locations = [...(formData.locations || [])];
    locations[index] = { ...locations[index], [field]: value };
    setFormData({ ...formData, locations });
  };

  const removeLocation = (index: number) => {
    const locations = formData.locations?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, locations });
  };

  const handleGeocodeZip = async (index: number, zip: string) => {
    if (!zip || zip.length !== 5) return;
    
    setIsGeocoding({ ...isGeocoding, [index]: true });
    try {
      const coords = await geocodeZip(zip);
      if (coords) {
        updateLocation(index, 'lat', coords.lat);
        updateLocation(index, 'lng', coords.lng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding({ ...isGeocoding, [index]: false });
    }
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...(formData.services || []), ''],
    });
  };

  const updateService = (index: number, value: string) => {
    const services = [...(formData.services || [])];
    services[index] = value;
    setFormData({ ...formData, services });
  };

  const removeService = (index: number) => {
    const services = formData.services?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, services });
  };

  const addInsurance = () => {
    setFormData({
      ...formData,
      insurance: [...(formData.insurance || []), { name: '', slug: '' }],
    });
  };

  const updateInsurance = (index: number, field: 'name' | 'slug', value: string) => {
    const insurance = [...(formData.insurance || [])];
    insurance[index] = { ...insurance[index], [field]: value };
    if (field === 'name') {
      insurance[index].slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    setFormData({ ...formData, insurance });
  };

  const removeInsurance = (index: number) => {
    const insurance = formData.insurance?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, insurance });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Practice: {practice.name}
          </DialogTitle>
          <DialogDescription>
            Update practice information. Changes apply immediately (admin override).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark-blue">Basic Information</h3>
            <div>
              <Label htmlFor="name">Practice Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark-blue">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-dark-blue">Primary Address</h3>
            <div>
              <Label htmlFor="address-line1">Street Address</Label>
              <Input
                id="address-line1"
                value={formData.address?.line1 || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address!, line1: e.target.value },
                })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="address-city">City</Label>
                <Input
                  id="address-city"
                  value={formData.address?.city || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, city: e.target.value },
                  })}
                />
              </div>
              <div>
                <Label htmlFor="address-state">State</Label>
                <Input
                  id="address-state"
                  value={formData.address?.state || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, state: e.target.value },
                  })}
                  placeholder="MO"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="address-zip">ZIP</Label>
                <Input
                  id="address-zip"
                  value={formData.address?.zip || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address!, zip: e.target.value },
                  })}
                  placeholder="63101"
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-brand-dark-blue">Practice Locations</h3>
              <Button type="button" onClick={addLocation} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </div>
            <div className="space-y-4">
              {formData.locations?.map((location, index) => (
                <div key={location.id || index} className="p-4 border rounded-lg space-y-3">
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
                      placeholder="Location name (optional)"
                      value={location.name || ''}
                      onChange={(e) => updateLocation(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Phone (optional)"
                      value={location.phone || ''}
                      onChange={(e) => updateLocation(index, 'phone', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Street address"
                    value={location.address}
                    onChange={(e) => updateLocation(index, 'address', e.target.value)}
                  />
                  <div className="grid grid-cols-4 gap-3">
                    <Input
                      placeholder="City"
                      value={location.city}
                      onChange={(e) => updateLocation(index, 'city', e.target.value)}
                    />
                    <Input
                      placeholder="State"
                      value={location.state}
                      onChange={(e) => updateLocation(index, 'state', e.target.value)}
                      maxLength={2}
                    />
                    <Input
                      placeholder="ZIP"
                      value={location.zip}
                      onChange={(e) => {
                        updateLocation(index, 'zip', e.target.value);
                        if (e.target.value.length === 5) {
                          handleGeocodeZip(index, e.target.value);
                        }
                      }}
                      maxLength={5}
                    />
                    <Button
                      type="button"
                      onClick={() => handleGeocodeZip(index, location.zip)}
                      variant="outline"
                      size="sm"
                      disabled={isGeocoding[index] || location.zip.length !== 5}
                    >
                      {isGeocoding[index] ? '...' : 'Geocode'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={location.lat || ''}
                      onChange={(e) => updateLocation(index, 'lat', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={location.lng || ''}
                      onChange={(e) => updateLocation(index, 'lng', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-brand-dark-blue">Services</h3>
              <Button type="button" onClick={addService} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
            <div className="space-y-2">
              {formData.services?.map((service, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={service}
                    onChange={(e) => updateService(index, e.target.value)}
                    placeholder="Service name..."
                  />
                  <Button
                    type="button"
                    onClick={() => removeService(index)}
                    variant="ghost"
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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

          {/* Practice Roster */}
          <PracticeRosterSection practiceId={practice.id} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
