'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MembershipPlan } from '@/types';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface PlanComparisonTableProps {
  plans: MembershipPlan[];
}

export function PlanComparisonTable({ plans }: PlanComparisonTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_FEATURES_COUNT = 8;
  // Helper function to expand hierarchical features ("Everything in Basic", etc.)
  const expandFeatures = (plan: MembershipPlan, allPlans: MembershipPlan[]): string[] => {
    const expandedFeatures: string[] = [];
    
    for (const feature of plan.features) {
      if (feature.startsWith('Everything in ')) {
        // Extract the plan name (e.g., "Basic" from "Everything in Basic")
        const planName = feature.replace('Everything in ', '').trim();
        // Find the referenced plan
        const referencedPlan = allPlans.find(p => p.name === planName);
        if (referencedPlan) {
          // Recursively expand the referenced plan's features
          expandedFeatures.push(...expandFeatures(referencedPlan, allPlans));
        }
      } else {
        // Regular feature, add it
        expandedFeatures.push(feature);
      }
    }
    
    return expandedFeatures;
  };

  // Expand features for each plan
  const expandedPlans = plans.map(plan => ({
    ...plan,
    expandedFeatures: expandFeatures(plan, plans),
  }));

  // Extract all unique features from expanded plans
  const allFeatures = Array.from(
    new Set(expandedPlans.flatMap((plan) => plan.expandedFeatures))
  );

  // Sort features to match the order they appear in plans (Basic first, then additions)
  const sortedFeatures = [...allFeatures].sort((a, b) => {
    // Find which plan first introduces each feature
    const aPlanIndex = expandedPlans.findIndex(p => p.expandedFeatures.includes(a));
    const bPlanIndex = expandedPlans.findIndex(p => p.expandedFeatures.includes(b));
    
    if (aPlanIndex !== bPlanIndex) {
      return aPlanIndex - bPlanIndex;
    }
    
    // If same plan, maintain original order within that plan
    const plan = expandedPlans[aPlanIndex];
    const aIndex = plan.expandedFeatures.indexOf(a);
    const bIndex = plan.expandedFeatures.indexOf(b);
    return aIndex - bIndex;
  });

  // Helper to check if a plan includes a feature (using expanded features)
  const hasFeature = (plan: MembershipPlan, feature: string) => {
    const expandedPlan = expandedPlans.find(p => p.id === plan.id);
    return expandedPlan?.expandedFeatures.includes(feature) ?? false;
  };

  // Determine which features to show
  const visibleFeatures = isExpanded 
    ? sortedFeatures 
    : sortedFeatures.slice(0, INITIAL_FEATURES_COUNT);
  const hasMoreFeatures = sortedFeatures.length > INITIAL_FEATURES_COUNT;

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
                {visibleFeatures.map((feature) => (
                  <TableRow key={feature} className="hover:bg-white/30">
                    <TableCell className="font-medium">{feature}</TableCell>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        {hasFeature(plan, feature) ? (
                          <Check 
                            className="h-5 w-5 mx-auto" 
                            style={{ color: '#16a34a' }}
                            aria-label="Included" 
                          />
                        ) : (
                          <X 
                            className="h-5 w-5 mx-auto" 
                            style={{ color: '#ef4444' }}
                            aria-label="Not included" 
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {hasMoreFeatures && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show All Features ({sortedFeatures.length - INITIAL_FEATURES_COUNT} more)
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
