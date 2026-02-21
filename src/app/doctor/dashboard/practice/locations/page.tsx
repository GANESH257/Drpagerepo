'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Practice, PracticeLocation } from '@/types/practice';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { geocodeZip } from '@/lib/services/geocodingService';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { MapPin, Phone, Clock, Plus, Loader2, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

/**
 * Generate location ID in format: loc_{practiceId}_{yyyyMMddHHmmss}_{random4}
 */
function generateLocationId(practiceId: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const random4 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `loc_${practiceId}_${yyyy}${MM}${dd}${HH}${mm}${ss}_${random4}`;
}

/**
 * Normalize address string for comparison
 */
function normalizeAddress(address: string, city: string, state: string, zip: string): string {
  return `${address.trim()}, ${city.trim()}, ${state.trim().toUpperCase()} ${zip.trim().replace(/\D/g, '')}`.toLowerCase();
}

/**
 * Check for duplicate address (excluding a specific location ID)
 */
function checkDuplicateAddress(
  practice: Practice,
  normalizedAddress: string,
  excludeLocationId?: string
): { hasDuplicate: boolean; warning?: string } {
  const locs = practice.locations ?? [];
  const duplicateAddress = locs.some(loc => {
    if (excludeLocationId && loc.id === excludeLocationId) return false;
    const locAddress = normalizeAddress(loc.address, loc.city, loc.state, loc.zip);
    return locAddress === normalizedAddress;
  });
  
  if (duplicateAddress) {
    return { hasDuplicate: true, warning: 'Another location with this address already exists.' };
  }
  
  return { hasDuplicate: false };
}

/**
 * Check for duplicate coordinates (excluding a specific location ID)
 */
function checkDuplicateCoords(
  practice: Practice,
  lat: number | null,
  lng: number | null,
  excludeLocationId?: string
): { hasDuplicate: boolean; warning?: string } {
  if (lat === null || lng === null) {
    return { hasDuplicate: false };
  }
  
  const locs = practice.locations ?? [];
  const duplicateCoords = locs.some(loc => {
    if (excludeLocationId && loc.id === excludeLocationId) return false;
    return loc.lat === lat && loc.lng === lng;
  });
  
  if (duplicateCoords) {
    return { hasDuplicate: false, warning: 'These coordinates match another location; map markers may overlap.' };
  }
  
  return { hasDuplicate: false };
}

/**
 * Validate location form data (reusable for add/edit)
 */
function validateLocationForm(
  formData: {
    address: string;
    city: string;
    state: string;
    zip: string;
    directionsUrl: string;
    lat: number | null;
    lng: number | null;
  },
  isEdit: boolean = false,
  locationId?: string
): { valid: boolean; error?: string } {
  if (!formData.address.trim()) {
    return { valid: false, error: 'Address is required' };
  }
  if (!formData.city.trim()) {
    return { valid: false, error: 'City is required' };
  }
  if (!formData.state.trim()) {
    return { valid: false, error: 'State is required' };
  }
  
  const stateUpper = formData.state.trim().toUpperCase();
  if (stateUpper.length !== 2 || !/^[A-Z]{2}$/.test(stateUpper)) {
    return { valid: false, error: 'State must be a 2-letter code (e.g., MO, IL)' };
  }
  
  const zipNormalized = formData.zip.trim().replace(/\D/g, '');
  if (zipNormalized.length !== 5 || !/^\d{5}$/.test(zipNormalized)) {
    return { valid: false, error: 'ZIP must be a 5-digit code' };
  }
  
  if (formData.lat === null || formData.lng === null) {
    return { valid: false, error: 'Coordinates are required. Please geocode ZIP or enter manually.' };
  }
  
  const lat: number = formData.lat;
  const lng: number = formData.lng;
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  // Validate directionsUrl if present
  if (formData.directionsUrl.trim() && !formData.directionsUrl.trim().match(/^https?:\/\//i)) {
    return { valid: false, error: 'Directions URL must start with http:// or https://' };
  }
  
  return { valid: true };
}

export default function PracticeLocationsPage() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add dialog and form state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [manualCoordsMode, setManualCoordsMode] = useState(false);
  const [locationId, setLocationId] = useState<string>('');
  
  // Edit dialog and form state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isGeocodingEdit, setIsGeocodingEdit] = useState(false);
  const [manualCoordsModeEdit, setManualCoordsModeEdit] = useState(false);
  
  const [editFormData, setEditFormData] = useState<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    hours: string;
    directionsUrl: string;
    lat: number | null;
    lng: number | null;
  }>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    hours: '',
    directionsUrl: '',
    lat: null,
    lng: null,
  });
  
  // Remove dialog state
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removingLocationId, setRemovingLocationId] = useState<string | null>(null);
  const [isSubmittingRemove, setIsSubmittingRemove] = useState(false);
  
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    hours: string;
    directionsUrl: string;
    lat: number | null;
    lng: number | null;
  }>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    hours: '',
    directionsUrl: '',
    lat: null,
    lng: null,
  });

  useEffect(() => {
    async function loadPractice() {
      try {
        const actor = getActorFromSession();
        assertPracticeAdmin(actor);
        
        if (actor.kind !== 'doctor' || !actor.practiceId) {
          throw new PermissionDeniedError('Practice admin must have practiceId');
        }
        
        const allPractices = await getAllPracticesForAdmin();
        const foundPractice = allPractices.find(p => p.id === actor.practiceId);
        
        if (!foundPractice) {
          throw new Error('Practice not found');
        }
        
        setPractice(foundPractice);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AuthRequiredError) {
          router.push('/join-us');
        } else if (error instanceof PermissionDeniedError) {
          router.push('/doctor/dashboard');
        }
        setIsLoading(false);
      }
    }
    loadPractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - router is stable, no need in deps

  // Generate location ID and reset form when dialog opens
  useEffect(() => {
    if (showAddDialog && practice) {
      const newId = generateLocationId(practice.id);
      setLocationId(newId);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        hours: '',
        directionsUrl: '',
        lat: null,
        lng: null,
      });
      setManualCoordsMode(false);
    }
  }, [showAddDialog, practice]);

  // Client-side validation (uses shared helper)
  const validateForm = (): { valid: boolean; error?: string } => {
    return validateLocationForm(formData, false);
  };

  // Duplicate detection (uses shared helpers)
  const checkDuplicates = (): { hasDuplicate: boolean; warning?: string } => {
    if (!practice) return { hasDuplicate: false };
    
    const normalizedAddr = normalizeAddress(formData.address, formData.city, formData.state, formData.zip);
    const addressCheck = checkDuplicateAddress(practice, normalizedAddr);
    
    if (addressCheck.hasDuplicate) {
      return addressCheck;
    }
    
    return checkDuplicateCoords(practice, formData.lat, formData.lng);
  };

  // ZIP geocoding
  const handleGeocodeZip = async () => {
    if (!formData.zip.trim()) {
      toast.error('Please enter a ZIP code first');
      return;
    }

    try {
      setIsGeocoding(true);
      const coords = await geocodeZip(formData.zip);
      setFormData(prev => ({
        ...prev,
        lat: coords.lat,
        lng: coords.lng,
      }));
      toast.success(`Coordinates set from ZIP: ${coords.label}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to geocode ZIP code');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Auto-geocode on ZIP blur
  const handleZipBlur = () => {
    // Only auto-geocode if:
    // 1. Manual mode is disabled
    // 2. ZIP is valid 5 digits
    // 3. Not currently geocoding
    // 4. Coordinates not already set for this ZIP (optional optimization)
    if (manualCoordsMode) return;
    if (isGeocoding) return;
    
    const zipNormalized = formData.zip.trim().replace(/\D/g, '');
    if (!/^\d{5}$/.test(zipNormalized)) return;
    
    handleGeocodeZip();
  };

  // Open edit dialog handler
  const handleOpenEditDialog = (location: PracticeLocation) => {
    setEditingLocationId(location.id);
    setEditFormData({
      name: location.name || '',
      address: location.address,
      city: location.city,
      state: location.state,
      zip: location.zip,
      phone: location.phone || '',
      hours: location.hours || '',
      directionsUrl: location.directionsUrl || '',
      lat: location.lat,
      lng: location.lng,
    });
    setManualCoordsModeEdit(false);
    setShowEditDialog(true);
  };

  // Edit dialog geocoding
  const handleEditGeocodeZip = async () => {
    if (!editFormData.zip.trim()) {
      toast.error('Please enter a ZIP code first');
      return;
    }

    try {
      setIsGeocodingEdit(true);
      const coords = await geocodeZip(editFormData.zip);
      setEditFormData(prev => ({
        ...prev,
        lat: coords.lat,
        lng: coords.lng,
      }));
      toast.success(`Coordinates set from ZIP: ${coords.label}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to geocode ZIP code');
    } finally {
      setIsGeocodingEdit(false);
    }
  };

  // Auto-geocode on ZIP blur (edit)
  const handleEditZipBlur = () => {
    if (manualCoordsModeEdit) return;
    if (isGeocodingEdit) return;
    
    const zipNormalized = editFormData.zip.trim().replace(/\D/g, '');
    if (!/^\d{5}$/.test(zipNormalized)) return;
    
    handleEditGeocodeZip();
  };

  // Edit validation
  const validateEditForm = (): { valid: boolean; error?: string } => {
    if (!editingLocationId) {
      return { valid: false, error: 'No location selected for editing' };
    }
    
    const validation = validateLocationForm(editFormData, true, editingLocationId);
    if (!validation.valid) {
      return validation;
    }
    
    return { valid: true };
  };

  // Edit duplicate detection
  const checkEditDuplicates = (): { hasDuplicate: boolean; warning?: string } => {
    if (!practice || !editingLocationId) return { hasDuplicate: false };
    
    const normalizedAddr = normalizeAddress(editFormData.address, editFormData.city, editFormData.state, editFormData.zip);
    const addressCheck = checkDuplicateAddress(practice, normalizedAddr, editingLocationId);
    
    if (addressCheck.hasDuplicate) {
      return addressCheck;
    }
    
    return checkDuplicateCoords(practice, editFormData.lat, editFormData.lng, editingLocationId);
  };

  // Open remove dialog handler
  const handleOpenRemoveDialog = (locationId: string) => {
    if (!practice) return;
    
    // Check if last location
    if ((practice.locations ?? []).length <= 1) {
      toast.error('Cannot remove the last remaining location. Practice must retain at least one location.');
      return;
    }
    
    setRemovingLocationId(locationId);
    setShowRemoveDialog(true);
  };

  // Remove submit handler
  const handleRemoveSubmit = async () => {
    if (!practice || !removingLocationId) return;
    
    // Find location being removed
    const removingLocation = (practice.locations ?? []).find(loc => loc.id === removingLocationId);
    
    if (!removingLocation) {
      toast.error('Location not found');
      setShowRemoveDialog(false);
      setRemovingLocationId(null);
      return;
    }
    
    // Validate last location rule again (safety check)
    if ((practice.locations ?? []).length <= 1) {
      toast.error('Cannot remove the last remaining location. Practice must retain at least one location.');
      setShowRemoveDialog(false);
      setRemovingLocationId(null);
      return;
    }
    
    try {
      setIsSubmittingRemove(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      // Submit approval request
      await submitApprovalRequest(actor, {
        type: 'practice_location_remove_request',
        payload: {
          practiceId: practice.id,
          locationId: removingLocationId,
        },
        target: {
          practiceId: practice.id,
        },
      });
      
      toast.success('Removal request submitted. Waiting for admin approval.');
      setShowRemoveDialog(false);
      setRemovingLocationId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit removal request');
    } finally {
      setIsSubmittingRemove(false);
    }
  };

  // Edit submit handler
  const handleEditSubmit = async () => {
    if (!practice || !editingLocationId) return;
    
    const validation = validateEditForm();
    if (!validation.valid) {
      toast.error(validation.error ?? 'Please fix the form errors');
      return;
    }
    
    const duplicateCheck = checkEditDuplicates();
    if (duplicateCheck.hasDuplicate) {
      toast.error(duplicateCheck.warning ?? 'A duplicate location was detected');
      return;
    }
    
    try {
      setIsSubmittingEdit(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      // Ensure coordinates are set
      if (editFormData.lat === null || editFormData.lng === null) {
        throw new Error('Coordinates are required');
      }
      
      const updatedLocation: PracticeLocation = {
        id: editingLocationId, // CRITICAL: Must match original location ID
        name: editFormData.name.trim() || undefined,
        address: editFormData.address.trim(),
        city: editFormData.city.trim(),
        state: editFormData.state.trim().toUpperCase(),
        zip: editFormData.zip.trim().replace(/\D/g, '').substring(0, 5),
        lat: editFormData.lat,
        lng: editFormData.lng,
        phone: editFormData.phone.trim() || undefined,
        hours: editFormData.hours.trim() || undefined,
        directionsUrl: editFormData.directionsUrl.trim() || undefined,
      };
      
      // Submit approval request
      await submitApprovalRequest(actor, {
        type: 'practice_location_edit_request',
        payload: {
          practiceId: practice.id,
          locationId: editingLocationId,
          updatedLocation,
        },
        target: {
          practiceId: practice.id,
        },
      });
      
      toast.success('Edit request submitted. Waiting for admin approval.');
      setShowEditDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit edit request');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!practice) return;
    
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.error ?? 'Please fix the form errors');
      return;
    }
    
    const duplicateCheck = checkDuplicates();
    if (duplicateCheck.hasDuplicate) {
      toast.error(duplicateCheck.warning ?? 'A duplicate location was detected');
      return;
    }
    
    // Note: duplicateCheck.warning (for coordinates) is shown in UI below, not here
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      // Ensure coordinates are set (validation already checked, but TypeScript needs this)
      if (formData.lat === null || formData.lng === null) {
        throw new Error('Coordinates are required');
      }
      
      const location: PracticeLocation = {
        id: locationId,
        name: formData.name.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        zip: formData.zip.trim().replace(/\D/g, '').substring(0, 5),
        lat: formData.lat,
        lng: formData.lng,
        phone: formData.phone.trim() || undefined,
        hours: formData.hours.trim() || undefined,
        directionsUrl: formData.directionsUrl.trim() || undefined,
      };
      
      // Submit approval request (async)
      await submitApprovalRequest(actor, {
        type: 'practice_location_add_request',
        payload: {
          practiceId: practice.id,
          location,
        },
        target: {
          practiceId: practice.id,
        },
      });
      
      toast.success('Location request submitted. Waiting for admin approval.');
      setShowAddDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit location request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
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

  const locations = practice.locations || [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Practice Locations"
        description="View all registered locations for your practice."
        actions={
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Submit a request to add a new location to your practice. This will require admin approval.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Location ID Display */}
                <div className="text-xs text-gray-500 pb-2 border-b">
                  Location ID: {locationId}
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Location Name (Optional)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Main Office, Satellite Location"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address Line 1 *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main Street"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="St. Louis"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        placeholder="MO"
                        maxLength={2}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '').substring(0, 5) }))}
                        placeholder="63101"
                        maxLength={5}
                        disabled={isSubmitting || isGeocoding}
                        onBlur={handleZipBlur}
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGeocodeZip}
                        disabled={!formData.zip.trim() || isSubmitting || isGeocoding || manualCoordsMode}
                      >
                        {isGeocoding ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Getting...
                          </>
                        ) : (
                          'Get Coordinates'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter ZIP and click "Get Coordinates" or it will auto-geocode on blur
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Optional Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Optional Information</h4>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(314) 555-1234"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Textarea
                      id="hours"
                      value={formData.hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                      placeholder="Monday-Friday: 8am-5pm"
                      disabled={isSubmitting}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="directionsUrl">Directions URL</Label>
                    <Input
                      id="directionsUrl"
                      value={formData.directionsUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, directionsUrl: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                      type="url"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Separator />

                {/* Duplicate Coordinates Warning */}
                {checkDuplicates().warning && !checkDuplicates().hasDuplicate && (
                  <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {checkDuplicates().warning}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Coordinates Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Coordinates</h4>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="manual-coords" className="text-sm font-normal cursor-pointer">
                        Enter manually
                      </Label>
                      <Switch
                        id="manual-coords"
                        checked={manualCoordsMode}
                        onCheckedChange={setManualCoordsMode}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {manualCoordsMode ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lat">Latitude *</Label>
                        <Input
                          id="lat"
                          type="number"
                          step="any"
                          value={formData.lat ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({ ...prev, lat: val === '' ? null : parseFloat(val) || null }));
                          }}
                          placeholder="38.6270"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lng">Longitude *</Label>
                        <Input
                          id="lng"
                          type="number"
                          step="any"
                          value={formData.lng ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({ ...prev, lng: val === '' ? null : parseFloat(val) || null }));
                          }}
                          placeholder="-90.1994"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {formData.lat !== null && formData.lng !== null ? (
                        <p className="text-sm text-gray-700">
                          Coordinates: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Enter ZIP code and click "Get Coordinates" to auto-fill coordinates
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isGeocoding}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Location Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Location Edit</DialogTitle>
            <DialogDescription>
              This submits an edit request for approval. Your location won't change until approved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Identity strip */}
            {editingLocationId && (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Location ID:</div>
                <div className="font-mono text-sm text-gray-700">{editingLocationId}</div>
                {practice && (() => {
                  const plocs = practice.locations ?? [];
                  const editingLocation = plocs.find(loc => loc.id === editingLocationId);
                  const editingIdx = plocs.findIndex(loc => loc.id === editingLocationId);
                  const editingName = editingLocation?.name || (editingIdx === 0 ? 'Main Office' : `Location ${editingIdx + 1}`);
                  return (
                    <div className="text-xs text-gray-600 mt-1">
                      Currently editing: <span className="font-semibold">{editingName}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Location Name (Optional)</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Main Office, Satellite Location"
                    disabled={isSubmittingEdit}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(314) 555-1234"
                    disabled={isSubmittingEdit}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-address">Address Line 1 *</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                  disabled={isSubmittingEdit}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-city">City *</Label>
                  <Input
                    id="edit-city"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="St. Louis"
                    disabled={isSubmittingEdit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-state">State *</Label>
                  <Input
                    id="edit-state"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                    placeholder="MO"
                    maxLength={2}
                    disabled={isSubmittingEdit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-zip">ZIP Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-zip"
                      value={editFormData.zip}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '').substring(0, 5) }))}
                      placeholder="63101"
                      maxLength={5}
                      disabled={isSubmittingEdit || isGeocodingEdit}
                      onBlur={handleEditZipBlur}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditGeocodeZip}
                      disabled={!editFormData.zip.trim() || isSubmittingEdit || isGeocodingEdit || manualCoordsModeEdit}
                    >
                      {isGeocodingEdit ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Getting...
                        </>
                      ) : (
                        'Get Coordinates'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter ZIP and click "Get Coordinates" or it will auto-geocode on blur
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Optional Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Optional Information</h4>
              
              <div>
                <Label htmlFor="edit-hours">Hours</Label>
                <Textarea
                  id="edit-hours"
                  value={editFormData.hours}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, hours: e.target.value }))}
                  placeholder="Monday-Friday: 8am-5pm"
                  disabled={isSubmittingEdit}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-directionsUrl">Directions URL</Label>
                <Input
                  id="edit-directionsUrl"
                  value={editFormData.directionsUrl}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, directionsUrl: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  type="url"
                  disabled={isSubmittingEdit}
                />
                <p className="text-xs text-gray-500 mt-1">Must start with https://</p>
              </div>
            </div>

            <Separator />

            {/* Duplicate Coordinates Warning */}
            {checkEditDuplicates().warning && !checkEditDuplicates().hasDuplicate && (
              <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {checkEditDuplicates().warning}
                </AlertDescription>
              </Alert>
            )}

            {/* Coordinates Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Coordinates</h4>
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-manual-coords" className="text-sm font-normal cursor-pointer">
                    Enter manually
                  </Label>
                  <Switch
                    id="edit-manual-coords"
                    checked={manualCoordsModeEdit}
                    onCheckedChange={setManualCoordsModeEdit}
                    disabled={isSubmittingEdit}
                  />
                </div>
              </div>

              {manualCoordsModeEdit ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-lat">Latitude *</Label>
                    <Input
                      id="edit-lat"
                      type="number"
                      step="any"
                      value={editFormData.lat ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditFormData(prev => ({ ...prev, lat: val === '' ? null : parseFloat(val) || null }));
                      }}
                      placeholder="38.6270"
                      disabled={isSubmittingEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-lng">Longitude *</Label>
                    <Input
                      id="edit-lng"
                      type="number"
                      step="any"
                      value={editFormData.lng ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditFormData(prev => ({ ...prev, lng: val === '' ? null : parseFloat(val) || null }));
                      }}
                      placeholder="-90.1994"
                      disabled={isSubmittingEdit}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  {editFormData.lat !== null && editFormData.lng !== null ? (
                    <p className="text-sm text-gray-700">
                      Coordinates: {editFormData.lat.toFixed(6)}, {editFormData.lng.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Enter ZIP code and click "Get Coordinates" to auto-fill coordinates
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmittingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={isSubmittingEdit || isGeocodingEdit}
            >
              {isSubmittingEdit ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Edit Request'
              )}
            </Button>
          </DialogFooter>
          <p className="text-xs text-gray-500 text-center mt-2">
            Admin approval required before changes take effect.
          </p>
        </DialogContent>
      </Dialog>

      {/* Remove Location Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Location Removal</AlertDialogTitle>
            <AlertDialogDescription>
              This creates an approval request. The location will NOT be removed immediately. Admin approval is required before the location is removed from your practice.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Location Summary */}
          {removingLocationId && practice && (() => {
            const plocs = practice.locations ?? [];
            const removingLocation = plocs.find(loc => loc.id === removingLocationId);
            if (!removingLocation) return null;
            
            const locationIndex = plocs.findIndex(loc => loc.id === removingLocationId);
            const locationName = removingLocation.name || (locationIndex === 0 ? 'Main Office' : `Location ${locationIndex + 1}`);
            
            return (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mt-4">
                <p className="font-semibold text-sm mb-2">{locationName}</p>
                <p className="text-sm text-gray-700">{removingLocation.address}</p>
                <p className="text-sm text-gray-700">
                  {removingLocation.city}, {removingLocation.state} {removingLocation.zip}
                </p>
                <p className="text-xs text-gray-500 mt-2 font-mono">
                  Location ID: {removingLocation.id}
                </p>
              </div>
            );
          })()}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmittingRemove}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveSubmit}
              disabled={isSubmittingRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmittingRemove ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Removal Request'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Locations Found
            </h3>
            <p className="text-gray-600">
              Your practice currently has no registered locations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {locations.map((location, index) => {
            const locationName = location.name || (index === 0 ? 'Main Office' : `Location ${index + 1}`);
            
            return (
              <Card key={location.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{locationName}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {location.city}, {location.state} {location.zip}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge variant="default" className="bg-blue-600 text-white">
                          Primary Location
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditDialog(location)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenRemoveDialog(location.id)}
                        disabled={locations.length <= 1}
                        title={locations.length <= 1 ? 'At least one location is required.' : 'Remove location'}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-700">{location.address}</p>
                  <p className="text-gray-700">
                    {location.city}, {location.state} {location.zip}
                  </p>
                  {location.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Phone className="h-4 w-4" />
                      {location.phone}
                    </div>
                  )}
                  {location.hours && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {location.hours}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    Location ID: {location.id}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
