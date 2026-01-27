import { MembershipPlan } from '@/types';

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    pricing: {
      monthly: 99,
      annual: 990, // 2 months free
    },
    description: 'Essential features for independent physicians getting started.',
    features: [
      'Directory listing',
      'Basic profile management',
      'Referral network access',
      'Community forum access',
      'Email support',
      'Profile verification',
      'Up to 2 practice locations',
      'Basic analytics',
    ],
    ctaLabel: 'Choose Plan',
    ctaHref: '/join-us',
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Most Popular',
    pricing: {
      monthly: 199,
      annual: 1990, // 2 months free
    },
    description: 'Comprehensive features for established practices seeking growth.',
    features: [
      'Everything in Basic',
      'Advanced profile customization',
      'Priority referral matching',
      'Appointment request system (Phase 2)',
      'Review management tools (Phase 3)',
      'Priority support',
      'Unlimited practice locations',
      'Advanced analytics & insights',
      'Publication showcase',
      'Featured listing placement',
    ],
    ctaLabel: 'Choose Plan',
    ctaHref: '/join-us',
  },
  {
    id: 'premier',
    name: 'Premier',
    pricing: {
      monthly: 'Contact us',
      annual: 'Contact us',
    },
    description: 'Enterprise-level features for large practices and groups.',
    features: [
      'Everything in Professional',
      'Multi-provider account management',
      'Custom integration support',
      'Dedicated account manager',
      'Custom reporting & analytics',
      'White-label options',
      'API access (Phase 2)',
      'Custom contract terms',
      'On-site training & onboarding',
      '24/7 priority support',
    ],
    ctaLabel: 'Contact Sales',
    ctaHref: '/join-us',
  },
];
