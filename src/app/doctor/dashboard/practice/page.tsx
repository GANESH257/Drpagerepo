'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Practice } from '@/types/practice';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { createApprovalRequest, getApprovalRequests } from '@/lib/api/approval-requests';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { getAllPracticesForAdmin, getDoctorsByPractice } from '@/lib/adminHelpers';
import { uploadImage, getUploadFullUrl } from '@/lib/api/upload';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { Edit, Upload, Loader2, X, ArrowRight } from 'lucide-react';

const PRACTICE_PROFILE_EDIT_TYPE = 'practice_admin_practice_profile_edit';

export default function PracticeDetailsPage() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [practiceDoctors, setPracticeDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingProfileEdit, setHasPendingProfileEdit] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    phone: '',
    email: '',
    website: '',
    logo: '' as string,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
    },
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadPractice() {
      try {
        const actor = getActorFromSession();
        assertPracticeAdmin(actor);
        
        if (actor.kind !== 'doctor' || !actor.practiceId) {
          throw new PermissionDeniedError('Practice admin must have practiceId');
        }
        
        // Load practice
        const allPractices = await getAllPracticesForAdmin();
        const foundPractice = allPractices.find(p => p.id === actor.practiceId);
        
        if (!foundPractice) {
          throw new Error('Practice not found');
        }
        
        setPractice(foundPractice);
        
        // Load practice doctors
        const doctorsInPractice = await getDoctorsByPractice(foundPractice.id);
        setPracticeDoctors(doctorsInPractice);
        
        // Pre-fill form (logo from practice.logo or API logo_url)
        const logo = foundPractice.logo ?? (foundPractice as { logo_url?: string }).logo_url ?? '';
        setFormData({
          description: foundPractice.description || '',
          phone: foundPractice.phone || '',
          email: foundPractice.email || '',
          website: foundPractice.website || '',
          logo: typeof logo === 'string' ? logo : '',
          address: {
            line1: foundPractice.address?.line1 || '',
            line2: foundPractice.address?.line2 || '',
            city: foundPractice.address?.city || '',
            state: foundPractice.address?.state || '',
            zip: foundPractice.address?.zip || '',
            country: foundPractice.address?.country || 'USA',
          },
        });
        
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
  }, [router]);

  // Pending approval badge: refetch when practice loads and when user switches back to this tab
  const practiceIdRef = useRef(practice?.id);
  practiceIdRef.current = practice?.id;

  const fetchPendingProfileEdit = useCallback(() => {
    const pid = practiceIdRef.current;
    if (!pid) {
      setHasPendingProfileEdit(false);
      return;
    }
    getApprovalRequests({ status: 'pending' })
      .then((requests) => {
        const pending = requests.some(
          (r) =>
            r.practice_id === pid &&
            r.type === PRACTICE_PROFILE_EDIT_TYPE &&
            (r.admin_status ?? 'pending') === 'pending'
        );
        setHasPendingProfileEdit(pending);
      })
      .catch(() => setHasPendingProfileEdit(false));
  }, []);

  useEffect(() => {
    if (!practice?.id) {
      setHasPendingProfileEdit(false);
      return;
    }
    fetchPendingProfileEdit();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchPendingProfileEdit();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [practice?.id, fetchPendingProfileEdit]);

  const handleSubmitEdit = async () => {
    if (!practice) return;
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      const currentLogo = practice.logo ?? (practice as { logo_url?: string }).logo_url ?? '';
      // Deep clone before snapshot (Engine Guard Requirement 1)
      const beforeSnapshot = (() => {
        try {
          if (typeof structuredClone !== 'undefined') {
            return structuredClone({
              name: practice.name,
              description: practice.description || '',
              phone: practice.phone || '',
              website: practice.website || '',
              logo_url: currentLogo || undefined,
              insurances: practice.insurance?.map(i => i.name) || [],
              services: practice.services || [],
            });
          } else {
            return JSON.parse(JSON.stringify({
              name: practice.name,
              description: practice.description || '',
              phone: practice.phone || '',
              website: practice.website || '',
              logo_url: currentLogo || undefined,
              insurances: practice.insurance?.map(i => i.name) || [],
              services: practice.services || [],
            }));
          }
        } catch (e) {
          return {
            name: practice.name,
            description: practice.description || '',
            phone: practice.phone || '',
            website: practice.website || '',
            logo_url: currentLogo || undefined,
            insurances: practice.insurance?.map(i => i.name) || [],
            services: practice.services || [],
          };
        }
      })();

      // Build after snapshot from formData; backend expects logo_url
      const afterSnapshot = {
        name: practice.name,
        description: formData.description || '',
        phone: formData.phone || '',
        website: formData.website || '',
        logo_url: formData.logo || undefined,
        insurances: practice.insurance?.map(i => i.name) || [],
        services: practice.services || [],
      };
      
      await createApprovalRequest({
        type: PRACTICE_PROFILE_EDIT_TYPE,
        practice_id: practice.id,
        payload: {
          practiceId: practice.id,
          before: beforeSnapshot,
          after: afterSnapshot,
        },
      });

      setHasPendingProfileEdit(true);
      toast.success('Practice profile changes submitted. They will apply once an admin approves.');
      setShowEditDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit edit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aip-teal)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice details...</p>
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

  return (
    <div className="space-y-8">
      {hasPendingProfileEdit && (
        <div className="flex items-center gap-2 flex-wrap text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
            Pending approval
          </Badge>
          <span>You have pending practice profile changes awaiting admin approval. Submitting again will update that request.</span>
        </div>
      )}
      <SectionHeader
        title="Practice Details"
        description={practice.name}
        variant="practice"
        actions={
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="dashboard">
                <Edit className="h-4 w-4 mr-2" />
                Request Edit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Practice Edit</DialogTitle>
                <DialogDescription>
                  Submit changes to practice details. These changes require admin approval.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Practice description..."
                  />
                </div>
                <div>
                  <Label>Practice logo</Label>
                  <div className="flex flex-col gap-2 mt-1">
                    {formData.logo && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 inline-flex">
                        <Image
                          src={formData.logo.startsWith('http') ? formData.logo : getUploadFullUrl(formData.logo)}
                          alt="Practice logo"
                          fill
                          className="object-contain"
                          unoptimized
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            if (t) t.style.display = 'none';
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-0.5 right-0.5 h-6 w-6 opacity-90 hover:opacity-100"
                          onClick={() => setFormData({ ...formData, logo: '' })}
                          aria-label="Remove logo"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setLogoUploading(true);
                          try {
                            const path = await uploadImage(file);
                            setFormData((prev) => ({ ...prev, logo: path }));
                          } catch (err) {
                            console.error('Logo upload failed:', err);
                            toast.error('Failed to upload logo');
                          } finally {
                            setLogoUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={logoUploading}
                      >
                        {logoUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        {logoUploading ? 'Uploading...' : formData.logo ? 'Change logo' : 'Upload logo'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Max 5 MB. Shown on practice profile and directory.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="practice@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="address-line1">Address Line 1</Label>
                  <Input
                    id="address-line1"
                    value={formData.address.line1}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, line1: e.target.value },
                    })}
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <Label htmlFor="address-line2">Address Line 2 (optional)</Label>
                  <Input
                    id="address-line2"
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
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })}
                      placeholder="IL"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      value={formData.address.zip}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, zip: e.target.value },
                      })}
                      placeholder="60601"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button variant="dashboard" onClick={handleSubmitEdit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Practice Info */}
      <Card className="card-practice-accent">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Practice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <div>
            <Label className="text-sm font-medium text-gray-500">Name</Label>
            <p className="mt-1 text-base font-medium text-gray-900">{practice.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Description</Label>
            <p className="mt-1 text-base text-gray-700">{practice.description || 'No description provided'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="mt-1 text-base font-medium text-gray-900">{practice.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="mt-1 text-base font-medium text-gray-900">{practice.email || 'N/A'}</p>
            </div>
          </div>
          {practice.website && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Website</Label>
              <p className="mt-1 text-base">
                <a href={practice.website} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--aip-teal)] hover:underline">
                  {practice.website}
                </a>
              </p>
            </div>
          )}
          <div>
            <Label className="text-sm font-medium text-gray-500">Address</Label>
            <p className="mt-1 text-base font-medium text-gray-900 leading-relaxed">
              {practice.address.line1}
              {practice.address.line2 && `, ${practice.address.line2}`}
              <br />
              {practice.address.city}, {practice.address.state} {practice.address.zip}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Practice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="card-practice-accent">
          <CardContent className="pt-6 pb-6">
            <div className="text-3xl font-bold text-gray-900">{practiceDoctors.length}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Doctors</div>
          </CardContent>
        </Card>
        <Card className="card-practice-accent">
          <CardContent className="pt-6 pb-6">
            <div className="text-3xl font-bold text-gray-900">{practice.specialties.length}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Specialties</div>
          </CardContent>
        </Card>
        <Card className="card-practice-accent">
          <CardContent className="pt-6 pb-6">
            <div className="text-3xl font-bold text-gray-900">{practice.locations?.length || 1}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Locations</div>
          </CardContent>
        </Card>
      </div>

      {/* Specialties */}
      {practice.specialties.length > 0 && (
        <Card className="card-practice-accent">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Specialties</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {practice.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1.5 text-sm font-medium rounded-full bg-[var(--aip-teal)]/10 text-[var(--aip-teal)]"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
