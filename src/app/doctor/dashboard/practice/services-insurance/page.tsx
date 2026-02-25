'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Practice, Insurance } from '@/types';
import { getActorFromSession, assertPracticeAdmin } from '@/lib/services/permissionService';
import { submitApprovalRequest } from '@/lib/services/approvalEngine';
import { AuthRequiredError, PermissionDeniedError } from '@/lib/services/errors';
import { getAllPracticesForAdmin } from '@/lib/adminHelpers';
import { SectionHeader } from '@/components/shared/approvals/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/lib/toast';
import { Plus, X } from 'lucide-react';

/** Fixed practice insurance options – always shown with Yes/No toggle. Sent as same insurance[] to backend. */
const PRACTICE_INSURANCE_OPTIONS: { name: string; slug: string }[] = [
  { name: 'Public', slug: 'public' },
  { name: 'Medicare', slug: 'medicare' },
  { name: 'Medicaid', slug: 'medicaid' },
  { name: 'Cash pay', slug: 'cashpay' },
];

export default function PracticeServicesInsurancePage() {
  const router = useRouter();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  /** Yes/No for each of the 4 practice insurance options (key = slug). */
  const [insuranceToggles, setInsuranceToggles] = useState<Record<string, boolean>>({
    public: false,
    medicare: false,
    medicaid: false,
    cashpay: false,
  });
  /** Additional insurances (other than the 4 fixed options). */
  const [otherInsurance, setOtherInsurance] = useState<Insurance[]>([]);
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
        const ins = foundPractice.insurance || [];
        const fixedSlugs = new Set(PRACTICE_INSURANCE_OPTIONS.map((o) => o.slug));
        setInsuranceToggles({
          public: ins.some((i) => i.slug === 'public' || i.name?.toLowerCase() === 'public'),
          medicare: ins.some((i) => i.slug === 'medicare' || i.name?.toLowerCase() === 'medicare'),
          medicaid: ins.some((i) => i.slug === 'medicaid' || i.name?.toLowerCase() === 'medicaid'),
          cashpay: ins.some((i) => i.slug === 'cashpay' || (i.name?.toLowerCase() ?? '').replace(/\s+/g, '') === 'cashpay'),
        });
        setOtherInsurance(ins.filter((i) => !fixedSlugs.has(i.slug) && !PRACTICE_INSURANCE_OPTIONS.some((o) => o.name.toLowerCase() === (i.name ?? '').toLowerCase())));
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

  /** Build full insurance array from 4 toggles + other list (same format as before, no backend change). */
  const getCurrentInsurance = (): Insurance[] => {
    const fromToggles = PRACTICE_INSURANCE_OPTIONS.filter((o) => insuranceToggles[o.slug]).map((o) => ({ name: o.name, slug: o.slug }));
    return [...fromToggles, ...otherInsurance];
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
          insurance: getCurrentInsurance(),
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
      const slug = newInsuranceSlug.trim().toLowerCase().replace(/\s+/g, '-');
      const newIns: Insurance = { name: newInsuranceName.trim(), slug };
      if (!otherInsurance.some((i) => i.slug === slug)) {
        setOtherInsurance([...otherInsurance, newIns]);
        setNewInsuranceName('');
        setNewInsuranceSlug('');
      }
    }
  };

  const removeOtherInsurance = (slug: string) => {
    setOtherInsurance(otherInsurance.filter((i) => i.slug !== slug));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--aip-teal)] mx-auto mb-4"></div>
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
      <Card className="glass-card">
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
                <div className="space-y-4">
                  <div className="flex gap-2">
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
                    />
                    <Button onClick={addService}>
                      <Plus className="h-4 w-4" />
                    </Button>
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
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Practice insurances and policies</CardTitle>
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
                    Toggle the four options below and add any other insurance. Changes require admin approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* 4 always-shown options with Yes/No toggle */}
                  {PRACTICE_INSURANCE_OPTIONS.map((opt) => (
                    <div key={opt.slug} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <Label htmlFor={`ins-${opt.slug}`} className="font-medium">{opt.name}</Label>
                      <Switch
                        id={`ins-${opt.slug}`}
                        checked={!!insuranceToggles[opt.slug]}
                        onCheckedChange={(checked) => setInsuranceToggles((prev) => ({ ...prev, [opt.slug]: checked }))}
                      />
                    </div>
                  ))}
                  {/* Add other insurances */}
                  <div className="pt-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Add other insurance</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={newInsuranceName}
                        onChange={(e) => setNewInsuranceName(e.target.value)}
                        placeholder="Insurance name..."
                      />
                      <Input
                        value={newInsuranceSlug}
                        onChange={(e) => setNewInsuranceSlug(e.target.value)}
                        placeholder="Slug..."
                      />
                    </div>
                    <Button onClick={addInsurance} className="w-full mt-2" variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Insurance
                    </Button>
                    {otherInsurance.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {otherInsurance.map((ins) => (
                          <div
                            key={ins.slug}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span>{ins.name}</span>
                            <button
                              type="button"
                              onClick={() => removeOtherInsurance(ins.slug)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
          <div className="space-y-3">
            {PRACTICE_INSURANCE_OPTIONS.map((opt) => (
              <div key={opt.slug} className="flex items-center justify-between py-1.5">
                <span className="text-sm">{opt.name}</span>
                <span className="text-xs font-medium text-muted-foreground">{insuranceToggles[opt.slug] ? 'Yes' : 'No'}</span>
              </div>
            ))}
            {otherInsurance.length > 0 && (
              <>
                <div className="border-t border-border pt-2 mt-2" />
                {otherInsurance.map((ins) => (
                  <div key={ins.slug} className="p-2 bg-gray-50 rounded text-sm">
                    {ins.name}
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
