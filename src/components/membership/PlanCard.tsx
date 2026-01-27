'use client';

import { MembershipPlan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: MembershipPlan;
  billingCycle: 'monthly' | 'annual';
  onSelect?: () => void;
  isSelected?: boolean;
  isCurrentPlan?: boolean;
  showSelectButton?: boolean;
}

export function PlanCard({
  plan,
  billingCycle,
  onSelect,
  isSelected = false,
  isCurrentPlan = false,
  showSelectButton = true,
}: PlanCardProps) {
  const price = plan.pricing[billingCycle];
  const isAnnual = billingCycle === 'annual';
  const priceDisplay =
    typeof price === 'number' ? `$${price.toLocaleString()}` : price;
  const pricePerMonth =
    typeof price === 'number' && isAnnual
      ? `$${Math.round(price / 12).toLocaleString()}/mo`
      : null;

  return (
    <Card
      className={cn(
        'relative h-full flex flex-col card-vibrant',
        isSelected && 'ring-2 ring-brand-teal ring-offset-2',
        isCurrentPlan && 'border-brand-teal border-2'
      )}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-brand-teal text-white">{plan.badge}</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-brand-dark-blue">
          {plan.name}
        </CardTitle>
        {plan.description && (
          <CardDescription className="text-sm mt-2">
            {plan.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Pricing */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-brand-dark-blue">
              {priceDisplay}
            </span>
            {isAnnual && typeof price === 'number' && (
              <span className="text-sm text-muted-foreground">/year</span>
            )}
            {!isAnnual && (
              <span className="text-sm text-muted-foreground">/month</span>
            )}
          </div>
          {pricePerMonth && (
            <p className="text-sm text-muted-foreground mt-1">
              {pricePerMonth} billed annually
            </p>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-brand-teal shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {showSelectButton && (
        <CardFooter className="pt-4">
          <Button
            onClick={onSelect}
            variant={isSelected || isCurrentPlan ? 'gradient' : 'default'}
            className="w-full"
            disabled={isCurrentPlan}
          >
            {isCurrentPlan
              ? 'Current Plan'
              : isSelected
                ? 'Selected'
                : plan.ctaLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}