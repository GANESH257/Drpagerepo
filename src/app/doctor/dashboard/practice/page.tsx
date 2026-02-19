'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Practice } from '@/types/practice';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { practices } from '@/data/practices';
import { getCreatedPractices, mergePractices } from '@/lib/storage/practiceStorage';
import { doctors } from '@/data/doctors';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { Edit } from 'lucide-react';

export default function PracticeDetailsPage() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    try {
      const actor = getActorFromSession();
      assertPracticeAdmin(actor);
      
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Practice admin must have practiceId');
      }
      
      // Load practice
      const allPractices = mergePractices([...practices, ...getCreatedPractices()]);
      const foundPractice = allPractices.find(p => p.id === actor.practiceId);
      
      if (!foundPractice) {
        throw new Error('Practice not found');
      }
      
      setPractice(foundPractice);
      
      // Pre-fill form
      setFormData({
        description: foundPractice.description || '',
        phone: foundPractice.phone || '',
        email: foundPractice.email || '',
        website: foundPractice.website || '',
        address: {
          line1: foundPractice.address.line1 || '',
          line2: foundPractice.address.line2 || '',
          city: foundPractice.address.city || '',
          state: foundPractice.address.state || '',
          zip: foundPractice.address.zip || '',
          country: foundPractice.address.country || 'USA',
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
  }, [router]);

  const handleSubmitEdit = async () => {
    if (!practice) return;
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      // Deep clone before snapshot (Engine Guard Requirement 1)
      const beforeSnapshot = (() => {
        try {
          // Use structuredClone if available (modern browsers)
          if (typeof structuredClone !== 'undefined') {
            return structuredClone({
              name: practice.name,
              description: practice.description || '',
              phone: practice.phone || '',
              website: practice.website || '',
              insurances: practice.insurance?.map(i => i.name) || [],
              services: practice.services || [],
            });
          } else {
            // Fallback to JSON parse/stringify
            return JSON.parse(JSON.stringify({
              name: practice.name,
              description: practice.description || '',
              phone: practice.phone || '',
              website: practice.website || '',
              insurances: practice.insurance?.map(i => i.name) || [],
              services: practice.services || [],
            }));
          }
        } catch (e) {
          // Final fallback
          return {
            name: practice.name,
            description: practice.description || '',
            phone: practice.phone || '',
            website: practice.website || '',
            insurances: practice.insurance?.map(i => i.name) || [],
            services: practice.services || [],
          };
        }
      })();
      
      // Build after snapshot from formData (full object, not partial)
      const afterSnapshot = {
        name: practice.name, // name typically doesn't change in edit form
        description: formData.description || '',
        phone: formData.phone || '',
        website: formData.website || '',
        insurances: practice.insurance?.map(i => i.name) || [], // preserve for now (not editable in form)
        services: practice.services || [], // preserve for now (not editable in form)
      };
      
      submitApprovalRequest(actor, {
        type: 'practice_edit_request',
        payload: {
          practiceId: practice.id,
          before: beforeSnapshot,
          after: afterSnapshot,
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
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
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

  const practiceDoctors = doctors.filter(d => d.practiceId === practice.id);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Practice Details"
        description={practice.name}
        actions={
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Request Edit
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
                <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Practice Info */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-600">Name</Label>
            <p className="font-medium">{practice.name}</p>
          </div>
          <div>
            <Label className="text-gray-600">Description</Label>
            <p className="text-gray-700">{practice.description || 'No description provided'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Phone</Label>
              <p className="font-medium">{practice.phone}</p>
            </div>
            <div>
              <Label className="text-gray-600">Email</Label>
              <p className="font-medium">{practice.email || 'N/A'}</p>
            </div>
          </div>
          {practice.website && (
            <div>
              <Label className="text-gray-600">Website</Label>
              <p className="font-medium">
                <a href={practice.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {practice.website}
                </a>
              </p>
            </div>
          )}
          <div>
            <Label className="text-gray-600">Address</Label>
            <p className="font-medium">
              {practice.address.line1}
              {practice.address.line2 && `, ${practice.address.line2}`}
              <br />
              {practice.address.city}, {practice.address.state} {practice.address.zip}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Practice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{practiceDoctors.length}</div>
            <div className="text-sm text-gray-600">Doctors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{practice.specialties.length}</div>
            <div className="text-sm text-gray-600">Specialties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{practice.locations?.length || 1}</div>
            <div className="text-sm text-gray-600">Locations</div>
          </CardContent>
        </Card>
      </div>

      {/* Specialties */}
      {practice.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {practice.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
