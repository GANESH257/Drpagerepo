'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Check,
  Download,
  CreditCard,
  Wallet,
  Crown,
} from 'lucide-react';
import { membershipPlans as fallbackPlans } from '@/data/membershipPlans';
import { PlanCard } from '@/components/membership/PlanCard';
import { getMyMembership } from '@/lib/api/memberships';
import { getMembershipPlans } from '@/lib/api/membership-plans';
import type { MembershipPlan as ApiPlan } from '@/lib/api/membership-plans';
import {
  initializeMembership,
  upgradeMembership,
  completeMembershipPayment,
  updateBillingCycle,
  updatePaymentMethod,
} from '@/lib/membershipStorage';
import { MembershipData, MembershipPlan } from '@/types';
import { formatDate as formatDateUtil } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

function mapApiPlanToUi(api: ApiPlan): MembershipPlan {
  const features = Array.isArray(api.features)
    ? api.features.map((f) => (typeof f === 'string' ? f : String(f)))
    : api.features
      ? [String(api.features)]
      : [];
  return {
    id: api.id,
    name: api.name,
    badge: api.badge,
    description: api.description,
    pricing: {
      monthly: api.monthly_price,
      annual: api.annual_price,
    },
    features,
    ctaLabel: api.cta_label ?? 'Get started',
    ctaHref: api.cta_href ?? '#',
  };
}

interface MembershipSectionProps {
  doctorId: string;
}

export function MembershipSection({ doctorId }: MembershipSectionProps) {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>(fallbackPlans);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    getMembershipPlans()
      .then((apiPlans) => {
        const active = (apiPlans ?? []).filter((p) => p.active !== false);
        setPlans(active.length > 0 ? active.map(mapApiPlanToUi) : fallbackPlans);
      })
      .catch(() => setPlans(fallbackPlans))
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    getMyMembership()
      .then((api) => {
        if (!api) {
          setMembership(null);
          return;
        }
        setMembership({
          planId: api.plan_id ?? api.planId ?? 'basic',
          billingCycle: (api.billing_cycle ?? api.billingCycle ?? 'annual') as 'monthly' | 'annual',
          status: (api.status === 'active' ? 'active' : api.status === 'expired' ? 'expired' : 'pending_payment') as 'active' | 'pending_payment' | 'expired',
          memberSince: api.start_date ?? api.created_at ?? new Date().toISOString(),
          renewalDate: api.expiry_date ?? api.updated_at ?? new Date().toISOString(),
          lastPaymentMethod: (api.payment_method === 'paypal' ? 'paypal' : api.payment_method === 'card' ? 'card' : null) as 'paypal' | 'card' | null,
          history: [],
        });
      })
      .catch(() => setMembership(null));
  }, [doctorId]);

  const refreshMembership = useCallback(() => {
    getMyMembership()
      .then((api) => {
        if (!api) {
          setMembership(null);
          return;
        }
        setMembership({
          planId: api.plan_id ?? 'basic',
          billingCycle: (api.billing_cycle ?? 'annual') as 'monthly' | 'annual',
          status: (api.status === 'active' ? 'active' : api.status === 'expired' ? 'expired' : 'pending_payment') as 'active' | 'pending_payment' | 'expired',
          memberSince: api.start_date ?? new Date().toISOString(),
          renewalDate: api.expiry_date ?? new Date().toISOString(),
          lastPaymentMethod: (api.payment_method === 'paypal' ? 'paypal' : api.payment_method === 'card' ? 'card' : null) as 'paypal' | 'card' | null,
          history: [],
        });
      })
      .catch(() => setMembership(null));
  }, []);

  const [planSelectorOpen, setPlanSelectorOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<
    'monthly' | 'annual'
  >('annual');
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize membership if it doesn't exist (local fallback for onboarding)
  const handleInitializeMembership = useCallback(() => {
    initializeMembership(doctorId, 'basic', 'annual');
    getMyMembership().then((api) => {
      if (api) {
        setMembership({
          planId: api.plan_id ?? 'basic',
          billingCycle: (api.billing_cycle ?? 'annual') as 'monthly' | 'annual',
          status: (api.status === 'active' ? 'active' : 'pending_payment') as 'active' | 'pending_payment' | 'expired',
          memberSince: api.start_date ?? new Date().toISOString(),
          renewalDate: api.expiry_date ?? new Date().toISOString(),
          lastPaymentMethod: null,
          history: [],
        });
      }
    });
  }, [doctorId]);

  // Get current plan data (from API plans or fallback)
  const currentPlan = useMemo(() => {
    if (!membership) return null;
    return plans.find((p) => p.id === membership.planId) || null;
  }, [membership, plans]);

  // Handle plan selection
  const handleSelectPlan = useCallback((planId: string) => {
    setSelectedPlanId(planId);
  }, []);

  // Handle plan upgrade confirmation
  const handleConfirmUpgrade = useCallback(() => {
    if (!selectedPlanId) return;

    setIsProcessing(true);
    upgradeMembership(doctorId, selectedPlanId, selectedBillingCycle);
    refreshMembership();
    setPlanSelectorOpen(false);
    setConfirmDialogOpen(false);
    setSelectedPlanId(null);
    setIsProcessing(false);
  }, [doctorId, selectedPlanId, selectedBillingCycle]);

  // Handle payment completion (demo)
  const handleMarkAsPaid = useCallback(() => {
    if (!membership) return;

    setIsProcessing(true);
    const paymentMethod = membership.lastPaymentMethod || 'paypal';
    completeMembershipPayment(doctorId, paymentMethod);
    refreshMembership();
    setIsProcessing(false);
  }, [doctorId, membership, refreshMembership]);

  // Handle billing cycle change
  const handleBillingCycleChange = useCallback(
    (checked: boolean) => {
      const newCycle = checked ? 'annual' : 'monthly';
      setSelectedBillingCycle(newCycle);
    },
    []
  );

  // Handle update billing cycle
  const handleUpdateBillingCycle = useCallback(() => {
    if (!membership) return;
    const newCycle =
      membership.billingCycle === 'annual' ? 'monthly' : 'annual';
    updateBillingCycle(doctorId, newCycle);
    refreshMembership();
  }, [doctorId, membership, refreshMembership]);

  // Handle payment method update
  const handleUpdatePaymentMethod = useCallback(
    (method: 'paypal' | 'card') => {
      updatePaymentMethod(doctorId, method);
      refreshMembership();
      setPaypalModalOpen(false);
      setCardModalOpen(false);
    },
    [doctorId, refreshMembership]
  );

  const formatDate = (dateString: string) =>
    formatDateUtil(dateString);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="gradient">Active</Badge>
        );
      case 'pending_payment':
        return (
          <Badge variant="pulse">
            Pending Payment
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">Expired</Badge>
        );
      default:
        return <Badge variant="colorful">{status}</Badge>;
    }
  };

  // If no membership exists, show initialization option
  if (!membership) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark-blue">
            Membership
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage membership details, renewals, and upgrades
          </p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No membership found
            </h3>
            <p className="text-muted-foreground mb-6">
              Please select a plan to get started with your membership.
            </p>
            <Button onClick={handleInitializeMembership} className="bg-brand-teal hover:bg-brand-teal/90">
              Initialize with Basic Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-dark-blue">
          Membership
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage membership details, renewals, and upgrades
        </p>
      </div>

      {/* Current Plan Summary */}
      <Card className="card-vibrant">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {currentPlan?.name || 'No Plan'}
              </CardTitle>
              <div className="mt-1 text-sm text-muted-foreground">
                {getStatusBadge(membership.status)}
              </div>
            </div>
            {membership.status === 'pending_payment' && (
              <Button
                onClick={handleMarkAsPaid}
                disabled={isProcessing}
                variant="gradient"
              >
                {isProcessing ? 'Processing...' : 'Mark as Paid (Demo)'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="font-semibold capitalize">
                {membership.billingCycle}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-semibold">
                {formatDate(membership.memberSince)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Renewal Date</p>
              <p className="font-semibold">
                {formatDate(membership.renewalDate)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setPlanSelectorOpen(true)}
              variant="outline"
            >
              Upgrade Plan
            </Button>
            <Button onClick={handleUpdateBillingCycle} variant="outline">
              Change Billing Cycle
            </Button>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Benefits */}
        <Card className="card-vibrant">
          <CardHeader>
            <CardTitle>Plan Benefits</CardTitle>
            <CardDescription>
              Features included in your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentPlan ? (
              <ul className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No plan selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="card-vibrant">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment method for membership renewals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Current Method
              </p>
              {membership.lastPaymentMethod ? (
                <div className="flex items-center gap-2">
                  {membership.lastPaymentMethod === 'paypal' ? (
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium capitalize">
                    {membership.lastPaymentMethod}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not set</p>
              )}
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setPaypalModalOpen(true)}
                variant="outline"
                size="sm"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Add PayPal
              </Button>
              <Button
                onClick={() => setCardModalOpen(true)}
                variant="outline"
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership History */}
      <Card className="card-vibrant">
        <CardHeader>
          <CardTitle>Membership History</CardTitle>
          <CardDescription>
            Recent transactions and membership changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membership.history && membership.history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {membership.history.slice(0, 6).map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="py-3 px-4 text-sm">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">
                        {transaction.plan}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ${transaction.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No transaction history available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan Selector Modal */}
      <Dialog open={planSelectorOpen} onOpenChange={setPlanSelectorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Membership Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that fits your needs. You can upgrade or downgrade
              at any time.
            </DialogDescription>
          </DialogHeader>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedBillingCycle('monthly')}
              className={cn(
                'text-sm font-medium transition-colors',
                selectedBillingCycle === 'monthly' && 'text-brand-dark-blue'
              )}
            >
              Monthly
            </button>
            <Switch
              checked={selectedBillingCycle === 'annual'}
              onCheckedChange={handleBillingCycleChange}
            />
            <button
              type="button"
              onClick={() => setSelectedBillingCycle('annual')}
              className={cn(
                'text-sm font-medium transition-colors',
                selectedBillingCycle === 'annual' && 'text-brand-dark-blue'
              )}
            >
              Annual
              <span className="ml-2 text-xs text-brand-teal font-normal">
                (Save 2 months)
              </span>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansLoading ? (
              <div className="col-span-full flex justify-center py-8 text-muted-foreground">
                Loading plans...
              </div>
            ) : (
              plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={selectedBillingCycle}
                isSelected={selectedPlanId === plan.id}
                isCurrentPlan={membership.planId === plan.id}
                onSelect={() => handleSelectPlan(plan.id)}
                showSelectButton={true}
              />
            ))
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setPlanSelectorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedPlanId) {
                  setConfirmDialogOpen(true);
                }
              }}
              disabled={!selectedPlanId}
              className="bg-brand-teal hover:bg-brand-teal/90"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your membership plan to{' '}
              <strong>
                {plans.find((p) => p.id === selectedPlanId)?.name}
              </strong>{' '}
              ({selectedBillingCycle})? Your membership status will be set to
              pending until payment is completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUpgrade}
              className="bg-brand-teal hover:bg-brand-teal/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PayPal Modal */}
      <Dialog open={paypalModalOpen} onOpenChange={setPaypalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add PayPal Account</DialogTitle>
            <DialogDescription>
              Connect your PayPal account for membership payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> This is a placeholder. In a real
                application, you would be redirected to PayPal to authorize the
                connection.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPaypalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdatePaymentMethod('paypal')}
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                Connect PayPal (Demo)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Modal */}
      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credit/Debit Card</DialogTitle>
            <DialogDescription>
              Add a payment card for membership renewals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> This is a placeholder form. Do not
                enter real card information. In a real application, this would
                use a secure payment processor.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="card-name">Name on Card (Optional)</Label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="card-number">Card Number (Optional)</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  disabled
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setCardModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdatePaymentMethod('card')}
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                Add Card (Demo)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
