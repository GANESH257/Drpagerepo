'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ApplicationDraft } from '@/types';
import { clearApplicationDraft, clearJoinEmail } from '@/lib/joinRequestStorage';
import { getMembershipPlans } from '@/lib/api/membership-plans';
import { transformMembershipPlansFromAPI } from '@/lib/api/membership-plans-transform';
import { MembershipPlan } from '@/types';
import { login } from '@/lib/api/auth';
import { createApprovalRequest } from '@/lib/api/approval-requests';

interface ApplicationReviewProps {
  draft: ApplicationDraft;
}

export function ApplicationReview({ draft }: ApplicationReviewProps) {
  const router = useRouter();
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const apiPlans = await getMembershipPlans();
        const transformedPlans = transformMembershipPlansFromAPI(apiPlans);
        setPlans(transformedPlans);
      } catch (err) {
        console.error('Error loading membership plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  if (!draft.basicDetails || !draft.selectedPlan || !draft.paymentMethod) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Application incomplete. Please complete all steps.</p>
        </CardContent>
      </Card>
    );
  }

  const { basicDetails, selectedPlan, paymentMethod, paymentDetails } = draft;
  const selectedPlanData = plans.find((p) => p.id === selectedPlan.planId);
  const planPrice = selectedPlanData?.pricing[selectedPlan.billingCycle];
  const priceDisplay = typeof planPrice === 'number' 
    ? `$${planPrice.toLocaleString()}` 
    : planPrice || 'Contact us';

  const handleSubmit = async () => {
    if (!confirmAccurate) {
      setError('Please confirm that your information is accurate');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get email and password for silent login
      const email = basicDetails.email;
      const tempPassword = typeof window !== 'undefined' 
        ? sessionStorage.getItem('aip_temp_password') 
        : null;

      if (!tempPassword) {
        throw new Error('Session expired. Please sign up again.');
      }

      // Silently login to get JWT token (no UI shown to user)
      let token: string;
      try {
        const loginResponse = await login(email, tempPassword);
        token = loginResponse.token;
        
        // Store token in localStorage so createApprovalRequest can use it
        if (typeof window !== 'undefined') {
          localStorage.setItem('aip_doctor_token', token);
          if (loginResponse.user) {
            localStorage.setItem('aip_doctor_user', JSON.stringify(loginResponse.user));
          }
        }
      } catch (loginErr) {
        console.error('Silent login error:', loginErr);
        throw new Error('Authentication failed. Please try again.');
      }

      // Determine approval request type and payload
      const practiceSelection = basicDetails.practiceSelection;
      let requestType: string;
      let apiPayload: any;
      let practiceId: string | undefined;
      let targetDoctorId: string | undefined;

      if (practiceSelection?.type === 'existing') {
        // Doctor joining existing practice
        requestType = 'doctor_join_practice';
        practiceId = practiceSelection.practiceId;
        // doctorId will be created on approval, use temporary ID for now
        const tempDoctorId = `temp-doctor-${Date.now()}`;
        targetDoctorId = tempDoctorId;
        apiPayload = {
          practiceId: practiceSelection.practiceId,
          doctorId: tempDoctorId,
          doctor: {
            email: basicDetails.email,
            fullName: basicDetails.fullName,
            credentials: basicDetails.credentials,
            specialty: basicDetails.specialty,
            phone: basicDetails.phone,
          },
          plan: {
            planId: selectedPlan.planId,
            billingCycle: selectedPlan.billingCycle,
          },
          paymentMethod,
          paymentDetails,
        };
      } else {
        // Creating new practice
        requestType = 'new_practice_with_admin_doctor';
        apiPayload = {
          practice: {
            name: practiceSelection?.type === 'new' 
              ? practiceSelection.practiceName 
              : basicDetails.practiceName || 'New Practice',
            website: practiceSelection?.type === 'new'
              ? practiceSelection.website
              : basicDetails.website,
            address: {
              line1: '',
              city: basicDetails.city,
              state: basicDetails.state,
              zip: '',
              country: 'USA',
            },
          },
          doctor: {
            email: basicDetails.email,
            fullName: basicDetails.fullName,
            credentials: basicDetails.credentials,
            specialty: basicDetails.specialty,
            phone: basicDetails.phone,
          },
          plan: {
            planId: selectedPlan.planId,
            billingCycle: selectedPlan.billingCycle,
          },
          paymentMethod,
          paymentDetails,
        };
      }

      // Create approval request via API
      await createApprovalRequest({
        type: requestType,
        practice_id: practiceId,
        target_doctor_id: targetDoctorId,
        payload: apiPayload,
      });

      // Clear temporary password and draft data
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('aip_temp_password');
      }
      clearApplicationDraft();
      clearJoinEmail();

      // Redirect to submitted page
      router.push('/join-us/submitted');
    } catch (err) {
      console.error('Error submitting join request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-brand-dark-blue mb-4">
            Review Your Application
          </h3>

          {/* Basic Details Section */}
          <div>
            <h4 className="font-semibold text-brand-dark-blue mb-3">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-medium">{basicDetails.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credentials:</span>
                <span className="font-medium">{basicDetails.credentials}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty:</span>
                <span className="font-medium">{basicDetails.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{basicDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{basicDetails.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{basicDetails.city}, {basicDetails.state}</span>
              </div>
              {basicDetails.practiceName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Practice Name:</span>
                  <span className="font-medium">{basicDetails.practiceName}</span>
                </div>
              )}
              {basicDetails.website && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website:</span>
                  <span className="font-medium">{basicDetails.website}</span>
                </div>
              )}
              {basicDetails.practiceSelection && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Practice:</span>
                  <span className="font-medium">
                    {basicDetails.practiceSelection.type === 'existing'
                      ? `Joining existing practice (ID: ${basicDetails.practiceSelection.practiceId})`
                      : `Creating new practice: ${basicDetails.practiceSelection.practiceName}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Plan Section */}
          <div>
            <h4 className="font-semibold text-brand-dark-blue mb-3">Membership Plan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{selectedPlanData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Cycle:</span>
                <span className="font-medium capitalize">{selectedPlan.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">
                  {priceDisplay}
                  {typeof planPrice === 'number' && (
                    <span className="text-muted-foreground ml-1">
                      /{selectedPlan.billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Method Section */}
          <div>
            <h4 className="font-semibold text-brand-dark-blue mb-3">Payment Method</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium capitalize">
                  {paymentMethod === 'paypal' ? 'PayPal' : 'Credit/Debit Card'}
                </span>
              </div>
              {paymentMethod === 'card' && paymentDetails?.cardName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card Name:</span>
                  <span className="font-medium">{paymentDetails.cardName}</span>
                </div>
              )}
            </div>
          </div>

          {basicDetails.messageToAdmin && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-brand-dark-blue mb-2">Message to Admin</h4>
                <p className="text-sm text-muted-foreground">{basicDetails.messageToAdmin}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Checkbox */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="confirm-accurate"
              checked={confirmAccurate}
              onCheckedChange={(checked) => {
                setConfirmAccurate(checked === true);
                if (error) setError('');
              }}
              className="mt-1"
            />
            <Label
              htmlFor="confirm-accurate"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I confirm my information is accurate and I understand that no charge will be made until after approval.
            </Label>
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2 ml-6" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!confirmAccurate || isSubmitting}
          className="bg-brand-teal hover:bg-brand-teal/90"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Join Request'}
        </Button>
      </div>
    </div>
  );
}
