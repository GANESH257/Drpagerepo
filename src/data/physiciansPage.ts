export interface PhysicianBenefit {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  link?: string;
  linkText?: string;
  size: 'small' | 'medium' | 'large';
  accentColor: 'blue' | 'green';
}

export interface ThriveFeature {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface JoinStep {
  number: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  image: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  badge?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface ImpactStat {
  id: string;
  value: string;
  label: string;
  icon: string; // Lucide icon name
}

export interface MemberStory {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export interface PracticeResource {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export const physicianBenefits: PhysicianBenefit[] = [
  {
    id: 'increase-patient-flow',
    title: 'Increase Your Patient Flow',
    description: 'Get discovered by thousands of patients searching our public directory and receive direct referrals from a trusted network of specialists.',
    icon: 'Users',
    size: 'large',
    accentColor: 'blue',
  },
  {
    id: 'reduce-overhead',
    title: 'Reduce Your Overhead',
    description: 'Gain access to group purchasing discounts on medical supplies, equipment, and insurance that are typically only available to large hospital networks.',
    icon: 'TrendingDown',
    size: 'medium',
    accentColor: 'green',
  },
  {
    id: 'simplify-administration',
    title: 'Simplify Your Administration',
    description: 'Our unified platform gives you a powerful digital presence, a secure referral network, and a community of peers to consult with, all in one place.',
    icon: 'Briefcase',
    size: 'medium',
    accentColor: 'blue',
  },
  {
    id: 'preserve-independence',
    title: 'Preserve Your Independence',
    description: 'We handle the network, you handle the medicine. The Alliance is run by physicians, for physicians, with the sole goal of helping private practice thrive.',
    icon: 'ShieldCheck',
    size: 'large',
    accentColor: 'green',
  },
];

export const thriveFeatures: ThriveFeature[] = [
  {
    id: 'group-purchasing',
    title: 'Group Purchasing',
    description: 'Access negotiated rates on supplies, vaccines, and malpractice insurance.',
    icon: 'ShoppingCart',
  },
  {
    id: 'payer-contracting',
    title: 'Payer Contracting',
    description: 'Leverage collective strategic advantage for better reimbursement rates.',
    icon: 'FileText',
  },
  {
    id: 'clinical-autonomy',
    title: 'Clinical Autonomy',
    description: 'Maintain full control over your practice operations and patient care decisions.',
    icon: 'ShieldCheck',
  },
  {
    id: 'referral-network',
    title: 'Referral Network',
    description: 'Connect with a trusted network of independent specialists.',
    icon: 'Network',
  },
  {
    id: 'advocacy',
    title: 'Advocacy',
    description: 'Representation at state and federal levels to protect independent practice.',
    icon: 'Megaphone',
  },
  {
    id: 'practice-support',
    title: 'Practice Support',
    description: 'Resources for billing, compliance, and operational efficiency.',
    icon: 'Briefcase',
  },
];

export const joinSteps: JoinStep[] = [
  {
    number: '01',
    title: 'Explore',
    description: 'Review membership benefits & tiers',
    icon: 'Search',
    image: '/for_dr.png',
  },
  {
    number: '02',
    title: 'Apply',
    description: 'Submit your practice application',
    icon: 'FileText',
    image: '/for_dr2.png',
  },
  {
    number: '03',
    title: 'Connect',
    description: 'Meet with our onboarding team',
    icon: 'Users',
    image: '/for_dr.png',
  },
  {
    number: '04',
    title: 'Grow',
    description: 'Access resources and start saving',
    icon: 'TrendingUp',
    image: '/grow.webp',
  },
];

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'solo-practice',
    name: 'Solo Practice',
    price: '$199/mo',
    features: [
      'Group purchasing access',
      'Basic payer contracting',
      'Networking events',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/join-us',
  },
  {
    id: 'group-practice',
    name: 'Group Practice',
    price: '$499/mo',
    badge: 'MOST POPULAR',
    features: [
      'All Solo features',
      'Advanced payer contracting',
      'Dedicated account manager',
      'Recruitment support',
    ],
    ctaLabel: 'Get Started',
    ctaHref: '/join-us',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Full network integration',
      'Custom contracting',
      'Executive strategy sessions',
    ],
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact-us',
  },
];

export const impactStats: ImpactStat[] = [
  {
    id: 'active-physicians',
    value: '120+',
    label: 'Active Physicians',
    icon: 'Users',
  },
  {
    id: 'medical-specialties',
    value: '15+',
    label: 'Medical Specialties',
    icon: 'Stethoscope',
  },
  {
    id: 'board-certified',
    value: '120+',
    label: 'Board Certified Specialists',
    icon: 'Award',
  },
  {
    id: 'patient-lives',
    value: '60k+',
    label: 'Patient Lives Covered',
    icon: 'Heart',
  },
];

export const memberStories: MemberStory[] = [
  {
    id: 'alan-grant',
    quote: 'Being part of this alliance has transformed my practice. The collective strategic advantage helped me negotiate better rates with payers, and the network support has been invaluable.',
    author: 'Dr. Alan Grant',
    role: 'Pediatrician, Private Practice',
  },
  {
    id: 'ellie-sattler',
    quote: 'The resources and community here are unmatched. I\'ve saved thousands on supplies through group purchasing, and the referral network has helped me provide better care to my patients.',
    author: 'Dr. Ellie Sattler',
    role: 'Family Medicine',
  },
];

export const practiceResources: PracticeResource[] = [
  {
    id: 'billing-guides',
    title: 'Billing Guides',
    description: 'Comprehensive guides to coding and reimbursement.',
    icon: 'FileText',
  },
  {
    id: 'compliance-toolkit',
    title: 'Compliance Toolkit',
    description: 'Stay up to date with the latest healthcare regulations.',
    icon: 'ShieldCheck',
  },
  {
    id: 'marketing-assets',
    title: 'Marketing Assets',
    description: 'Tools to grow your patient base and online presence.',
    icon: 'Megaphone',
  },
];
