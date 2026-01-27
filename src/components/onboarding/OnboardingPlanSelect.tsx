'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlanCard } from '@/components/membership/PlanCard';
import { membershipPlans } from '@/data/membershipPlans';
import { MembershipPlan } from '@/types';
import { cn } from '@/lib/utils';

interface OnboardingPlanSelectProps {
  initialPlanId?: string;
  initialBillingCycle?: 'monthly' | 'annual';
  onContinue: (planId: string, billingCycle: 'monthly' | 'annual') => void;
}

export function OnboardingPlanSelect({
  initialPlanId,
  initialBillingCycle = 'annual',
  onContinue,
}: OnboardingPlanSelectProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    initialBillingCycle
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId || null
  );
  const [error, setError] = useState('');

  const handleBillingChange = useCallback((checked: boolean) => {
    setBillingCycle(checked ? 'annual' : 'monthly');
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setError('');
  };

  const handleContinue = () => {
    if (!selectedPlanId) {
      setError('Please select a membership plan');
      return;
    }

    onContinue(selectedPlanId, billingCycle);
  };

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Label
          htmlFor="billing-cycle"
          className={cn(
            'text-sm font-medium',
            billingCycle === 'monthly' && 'text-brand-dark-blue'
          )}
        >
          Monthly
        </Label>
        <Switch
          id="billing-cycle"
          checked={billingCycle === 'annual'}
          onCheckedChange={handleBillingChange}
        />
        <Label
          htmlFor="billing-cycle"
          className={cn(
            'text-sm font-medium',
            billingCycle === 'annual' && 'text-brand-dark-blue'
          )}
        >
          Annual
          <span className="ml-2 text-xs text-brand-teal font-normal">
            (Save 2 months)
          </span>
        </Label>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isSelected={selectedPlanId === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
            showSelectButton={true}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          className="bg-brand-teal hover:bg-brand-teal/90"
          disabled={!selectedPlanId}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
