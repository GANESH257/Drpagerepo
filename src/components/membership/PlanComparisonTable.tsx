'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { MembershipPlan } from '@/types';
import { Check, X } from 'lucide-react';

interface PlanComparisonTableProps {
  plans: MembershipPlan[];
}

export function PlanComparisonTable({ plans }: PlanComparisonTableProps) {
  // Extract all unique features across all plans
  const allFeatures = Array.from(
    new Set(plans.flatMap((plan) => plan.features))
  );

  // Helper to check if a plan includes a feature
  const hasFeature = (plan: MembershipPlan, feature: string) => {
    return plan.features.includes(feature);
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold text-brand-dark-blue mb-6 text-center">
        Feature Comparison
      </h3>
      <Card className="card-vibrant shadow-lg">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] bg-white/50">Feature</TableHead>
                  {plans.map((plan) => (
                    <TableHead key={plan.id} className="text-center bg-white/50">
                      {plan.name}
                      {plan.badge && (
                        <span className="block text-xs text-brand-teal font-normal mt-1">
                          {plan.badge}
                        </span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFeatures.map((feature) => (
                  <TableRow key={feature} className="hover:bg-white/30">
                    <TableCell className="font-medium">{feature}</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        {hasFeature(plan, feature) ? (
                          <Check className="h-5 w-5 text-brand-teal mx-auto" aria-label="Included" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 mx-auto" aria-label="Not included" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
