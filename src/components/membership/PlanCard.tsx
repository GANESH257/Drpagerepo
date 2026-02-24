'use client';

import { MembershipPlan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Briefcase, Crown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAN_ICONS: Record<string, LucideIcon> = {
  basic: Zap,
  professional: Briefcase,
  premier: Crown,
};

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
        'group relative h-full flex flex-col overflow-visible transition-all duration-500 ease-out data-scroll-exclude',
        'bg-white/50 backdrop-blur-xl border border-gray-200/80 -translate-y-3 shadow-2xl shadow-black/15',
        'hover:-translate-y-5 hover:shadow-[0_28px_60px_-12px_rgba(15,95,168,0.25),0_0_0_1px_rgba(15,95,168,0.08)] hover:border-brand-dark-blue/60 hover:scale-[1.02] hover:bg-white/75',
        isSelected && 'ring-2 ring-brand-teal ring-offset-2',
        isCurrentPlan && 'border-brand-teal border-2'
      )}
    >
      {/* Decorative layers clipped to card shape so badge can overflow */}
      <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-brand-teal/10 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/5 via-transparent to-brand-teal/5" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/15 via-brand-teal/10 to-brand-dark-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-blue/10 via-brand-teal/5 to-transparent animate-gradient-shift" />
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-brand-teal/5 to-brand-dark-blue/10 animate-gradient-shift-reverse" />
        </div>
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
          <div className="absolute inset-0 floating" style={{ backgroundImage: 'radial-gradient(circle, rgba(15, 95, 168, 0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-teal/15 group-hover:bg-brand-teal/30 group-hover:scale-150 rounded-full blur-3xl transition-all duration-500" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-dark-blue/15 group-hover:bg-brand-dark-blue/30 group-hover:scale-150 rounded-full blur-3xl transition-all duration-500" />
      </div>

      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <Badge className="bg-brand-teal text-white">{plan.badge}</Badge>
        </div>
      )}

      <CardHeader className="relative z-10 text-center pb-4">
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl text-white relative overflow-hidden',
              'transition-all duration-500 ease-out group-hover:scale-125 group-hover:shadow-[0_0_30px_rgba(15,95,168,0.4)]',
              'bg-gradient-to-br from-brand-dark-blue to-brand-teal'
            )}
            aria-hidden
          >
            {(() => {
              const Icon = PLAN_ICONS[plan.id] ?? Briefcase;
              return <Icon className="h-10 w-10" />;
            })()}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-brand-dark-blue">
          {plan.name}
        </CardTitle>
        {plan.description && (
          <CardDescription className="text-sm mt-2">
            {plan.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="relative z-10 flex-1 space-y-6">
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
        <CardFooter className="relative z-10 pt-4">
          <Button
            onClick={onSelect}
            className={cn(
              'w-full shadow-md hover:shadow-lg transition-all duration-300 focus-ring hover:scale-105',
              isCurrentPlan
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed hover:scale-100'
                : 'bg-gradient-to-r from-brand-dark-blue to-brand-teal text-white hover:from-brand-dark-blue/90 hover:to-brand-teal/90'
            )}
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