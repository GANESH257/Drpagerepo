'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlanCard } from '@/components/membership/PlanCard';
import { getMembershipPlans } from '@/lib/api/membership-plans';
import { transformMembershipPlansFromAPI } from '@/lib/api/membership-plans-transform';
import { MembershipPlan } from '@/types';
import { cn } from '@/lib/utils';

interface ApplicationPlanSelectProps {
  initialPlanId?: string;
  initialBillingCycle?: 'monthly' | 'annual';
  onContinue: (planId: string, billingCycle: 'monthly' | 'annual') => void;
}

export function ApplicationPlanSelect({
  initialPlanId,
  initialBillingCycle = 'annual',
  onContinue,
}: ApplicationPlanSelectProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    initialBillingCycle
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId || null
  );
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        setLoadError(null);
        const apiPlans = await getMembershipPlans();
        const transformedPlans = transformMembershipPlansFromAPI(apiPlans);
        setPlans(transformedPlans);
      } catch (err) {
        console.error('Error loading membership plans:', err);
        setLoadError('Failed to load membership plans. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

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
        <button
          type="button"
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            'text-sm font-medium transition-colors',
            billingCycle === 'monthly' && 'text-brand-dark-blue'
          )}
        >
          Monthly
        </button>
        <Switch
          id="billing-cycle"
          checked={billingCycle === 'annual'}
          onCheckedChange={handleBillingChange}
        />
        <button
          type="button"
          onClick={() => setBillingCycle('annual')}
          className={cn(
            'text-sm font-medium transition-colors',
            billingCycle === 'annual' && 'text-brand-dark-blue'
          )}
        >
          Annual
          <span className="ml-2 text-xs text-brand-teal font-normal">
            (Save 2 months)
          </span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
            <p className="text-gray-600">Loading membership plans...</p>
          </div>
        </div>
      ) : loadError ? (
        <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
          {loadError}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center bg-gray-50 p-6 rounded-md">
          No membership plans available. Please contact support.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
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
      )}

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
