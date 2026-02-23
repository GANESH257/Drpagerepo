'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Practice, Insurance } from '@/types';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { practices } from '@/data/practices';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { Plus, X } from 'lucide-react';

export default function PracticeServicesInsurancePage() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [newInsuranceName, setNewInsuranceName] = useState('');
  const [newInsuranceSlug, setNewInsuranceSlug] = useState('');

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
        setServices(foundPractice.services || []);
        setInsurance(foundPractice.insurance || []);
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

  const handleSubmitServices = async () => {
    if (!practice) return;
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      await submitApprovalRequest(actor, {
        type: 'practice_insurance_services_change_request',
        payload: {
          services,
        },
        target: {
          practiceId: practice.id,
        },
      });
      
      toast.success('Services change request submitted. Waiting for admin approval.');
      setShowServicesDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit services change');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInsurance = async () => {
    if (!practice) return;
    
    try {
      setIsSubmitting(true);
      const actor = getActorFromSession();
      if (actor.kind !== 'doctor' || !actor.practiceId) {
        throw new PermissionDeniedError('Must be practice admin');
      }
      
      await submitApprovalRequest(actor, {
        type: 'practice_insurance_services_change_request',
        payload: {
          insurance,
        },
        target: {
          practiceId: practice.id,
        },
      });
      
      toast.success('Insurance change request submitted. Waiting for admin approval.');
      setShowInsuranceDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit insurance change');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter(s => s !== service));
  };

  const addInsurance = () => {
    if (newInsuranceName.trim() && newInsuranceSlug.trim()) {
      const newIns: Insurance = {
        name: newInsuranceName.trim(),
        slug: newInsuranceSlug.trim(),
      };
      if (!insurance.find(i => i.slug === newIns.slug)) {
        setInsurance([...insurance, newIns]);
        setNewInsuranceName('');
        setNewInsuranceSlug('');
      }
    }
  };

  const removeInsurance = (slug: string) => {
    setInsurance(insurance.filter(i => i.slug !== slug));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5FA8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services and insurance...</p>
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
    <div className="space-y-6">
      <SectionHeader
        title="Services & Insurance"
        description="Manage practice services and accepted insurance"
      />

      {/* Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Services</CardTitle>
            <Dialog open={showServicesDialog} onOpenChange={setShowServicesDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Edit Services
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Services</DialogTitle>
                  <DialogDescription>
                    Add or remove services. Changes require admin approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4" data-scroll-exclude>
                  <div className="flex gap-2" data-scroll-exclude>
                    <div data-scroll-exclude className="flex-1">
                      <Input
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addService();
                          }
                        }}
                        placeholder="Add service..."
                        data-scroll-speed="0"
                      />
                    </div>
                    <div data-scroll-exclude>
                      <Button onClick={addService} data-scroll-speed="0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {service}
                        <button
                          onClick={() => removeService(service)}
                          className="hover:text-blue-600"
                          data-scroll-speed="0"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowServicesDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitServices} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-gray-600">No services listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <span
                  key={service}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {service}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Accepted Insurance</CardTitle>
            <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Edit Insurance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Insurance</DialogTitle>
                  <DialogDescription>
                    Add or remove insurance providers. Changes require admin approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4" data-scroll-exclude>
                  <div className="grid grid-cols-2 gap-2" data-scroll-exclude>
                    <div data-scroll-exclude>
                      <Input
                        value={newInsuranceName}
                        onChange={(e) => setNewInsuranceName(e.target.value)}
                        placeholder="Insurance name..."
                        data-scroll-speed="0"
                      />
                    </div>
                    <div data-scroll-exclude>
                      <Input
                        value={newInsuranceSlug}
                        onChange={(e) => setNewInsuranceSlug(e.target.value)}
                        placeholder="Slug..."
                        data-scroll-speed="0"
                      />
                    </div>
                  </div>
                  <div data-scroll-exclude>
                    <Button onClick={addInsurance} className="w-full" data-scroll-speed="0">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Insurance
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {insurance.map((ins) => (
                      <div
                        key={ins.slug}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>{ins.name}</span>
                        <button
                          onClick={() => removeInsurance(ins.slug)}
                          className="text-red-600 hover:text-red-800"
                          data-scroll-speed="0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInsuranceDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitInsurance} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {insurance.length === 0 ? (
            <p className="text-gray-600">No insurance providers listed</p>
          ) : (
            <div className="space-y-2">
              {insurance.map((ins) => (
                <div key={ins.slug} className="p-2 bg-gray-50 rounded">
                  {ins.name}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
