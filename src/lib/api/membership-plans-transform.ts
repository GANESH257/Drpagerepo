/**
 * Transformation utilities for Membership Plans
 * Converts between backend API format (snake_case, flat) and frontend format (camelCase, nested pricing)
 */

import { MembershipPlan as ApiMembershipPlan } from './membership-plans';
import { MembershipPlan as FrontendMembershipPlan } from '@/types';

/**
 * Normalize features to always be an array
 */
function normalizeFeatures(features: any): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (typeof features === 'object') {
    // If it's an object, try to convert to array
    return Object.values(features).filter(v => typeof v === 'string') as string[];
  }
  return [];
}

/**
 * Transform API membership plan to frontend format
 */
export function transformMembershipPlanFromAPI(
  apiPlan: ApiMembershipPlan
): FrontendMembershipPlan {
  return {
    id: apiPlan.id,
    name: apiPlan.name,
    badge: apiPlan.badge,
    pricing: {
      monthly: apiPlan.monthly_price,
      annual: apiPlan.annual_price,
    },
    description: apiPlan.description,
    features: normalizeFeatures(apiPlan.features),
    ctaLabel: apiPlan.cta_label || 'Choose Plan',
    ctaHref: apiPlan.cta_href || '/join-us',
  };
}

/**
 * Transform frontend membership plan to API format
 */
export function transformMembershipPlanToAPI(
  frontendPlan: Partial<FrontendMembershipPlan>
): Partial<ApiMembershipPlan> {
  const apiPlan: Partial<ApiMembershipPlan> = {};

  if (frontendPlan.id !== undefined) {
    apiPlan.id = frontendPlan.id;
  }
  if (frontendPlan.name !== undefined) {
    apiPlan.name = frontendPlan.name;
  }
  if (frontendPlan.badge !== undefined) {
    apiPlan.badge = frontendPlan.badge;
  }
  if (frontendPlan.pricing) {
    // Convert string prices to numbers if needed
    apiPlan.monthly_price = typeof frontendPlan.pricing.monthly === 'string' 
      ? parseFloat(frontendPlan.pricing.monthly) || 0
      : frontendPlan.pricing.monthly;
    apiPlan.annual_price = typeof frontendPlan.pricing.annual === 'string'
      ? parseFloat(frontendPlan.pricing.annual) || 0
      : frontendPlan.pricing.annual;
  }
  if (frontendPlan.description !== undefined) {
    apiPlan.description = frontendPlan.description;
  }
  if (frontendPlan.features !== undefined) {
    apiPlan.features = frontendPlan.features;
  }
  if (frontendPlan.ctaLabel !== undefined) {
    apiPlan.cta_label = frontendPlan.ctaLabel;
  }
  if (frontendPlan.ctaHref !== undefined) {
    apiPlan.cta_href = frontendPlan.ctaHref;
  }

  return apiPlan;
}

/**
 * Transform array of API membership plans to frontend format
 */
export function transformMembershipPlansFromAPI(
  apiPlans: ApiMembershipPlan[]
): FrontendMembershipPlan[] {
  return apiPlans.map(transformMembershipPlanFromAPI);
}
