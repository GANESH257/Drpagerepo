'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ApplicationDraft } from '@/types';
import { submitJoinRequest, clearApplicationDraft, clearJoinEmail } from '@/lib/joinRequestStorage';
import { membershipPlans } from '@/data/membershipPlans';

interface ApplicationReviewProps {
  draft: ApplicationDraft;
}

export function ApplicationReview({ draft }: ApplicationReviewProps) {
  const router = useRouter();
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  const selectedPlanData = membershipPlans.find((p) => p.id === selectedPlan.planId);
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
      // Create join request
      const request = submitJoinRequest({
        applicant: {
          email: basicDetails.email,
          fullName: basicDetails.fullName,
          credentials: basicDetails.credentials,
          specialty: basicDetails.specialty,
          phone: basicDetails.phone,
          city: basicDetails.city,
          state: basicDetails.state,
          practiceName: basicDetails.practiceName,
          website: basicDetails.website,
          messageToAdmin: basicDetails.messageToAdmin,
          practiceSelection: basicDetails.practiceSelection,
        },
        plan: {
          planId: selectedPlan.planId,
          billingCycle: selectedPlan.billingCycle,
        },
        paymentMethod,
        paymentDetails,
      });

      // Clear draft and email
      clearApplicationDraft();
      clearJoinEmail();

      // Redirect to submitted page
      router.push('/join-us/submitted');
    } catch (err) {
      console.error('Error submitting join request:', err);
      setError('Failed to submit request. Please try again.');
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
