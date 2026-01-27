import { InsuranceResource } from '@/types';

export const insuranceResources: InsuranceResource[] = [
  {
    title: 'Understanding HMO Plans',
    description: 'Health Maintenance Organizations provide comprehensive care through a network of providers. Learn about HMO benefits and limitations.',
    url: '/public-health/articles/understanding-hmo-plans',
    type: 'internal',
  },
  {
    title: 'PPO vs HMO: Choosing the Right Plan',
    description: 'Compare Preferred Provider Organizations and HMOs to find the best plan for your healthcare needs and budget.',
    url: '/public-health/articles/ppo-vs-hmo-choosing-right-plan',
    type: 'internal',
  },
  {
    title: 'EPO Plans Explained',
    description: 'Exclusive Provider Organizations offer lower costs but require staying within a specific network. Understand EPO coverage details.',
    url: '/public-health/articles/epo-plans-explained',
    type: 'internal',
  },
  {
    title: 'Healthcare.gov',
    description: 'Official marketplace for health insurance plans. Compare options, check eligibility, and enroll in coverage.',
    url: 'https://www.healthcare.gov/',
    type: 'external',
  },
  {
    title: 'Medicare Information',
    description: 'Learn about Medicare coverage, enrollment, and benefits for seniors and people with disabilities.',
    url: 'https://www.medicare.gov/',
    type: 'external',
  },
  {
    title: 'Medicaid Eligibility',
    description: 'Find out if you qualify for Medicaid coverage and how to apply in your state.',
    url: 'https://www.medicaid.gov/',
    type: 'external',
  },
  {
    title: 'Understanding Your Insurance Card',
    description: 'Learn how to read your insurance card and understand important information like your policy number and coverage details.',
    url: '/public-health/articles/understanding-insurance-card',
    type: 'internal',
  },
  {
    title: 'Preventive Care Coverage',
    description: 'Most insurance plans cover preventive services at no cost. Learn what\'s included and how to access these benefits.',
    url: '/public-health/articles/preventive-care-coverage',
    type: 'internal',
  },
  {
    title: 'Appealing Insurance Denials',
    description: 'If your insurance claim is denied, you have the right to appeal. Learn the process and your options.',
    url: '/public-health/articles/appealing-insurance-denials',
    type: 'internal',
  },
  {
    title: 'Finding In-Network Providers',
    description: 'Using in-network providers saves money. Learn how to find and verify that your doctor is in your insurance network.',
    url: '/public-health/articles/finding-in-network-providers',
    type: 'internal',
  },
  {
    title: 'Understanding Deductibles and Copays',
    description: 'Learn the difference between deductibles, copays, and coinsurance, and how they affect your healthcare costs.',
    url: '/public-health/articles/understanding-deductibles-copays',
    type: 'internal',
  },
  {
    title: 'Health Savings Accounts (HSAs)',
    description: 'HSAs offer tax advantages for saving money for medical expenses. Understand eligibility and benefits.',
    url: '/public-health/articles/health-savings-accounts',
    type: 'internal',
  },
];

export const insuranceTypes = {
  hmo: {
    name: 'HMO (Health Maintenance Organization)',
    description: 'HMO plans require you to choose a primary care physician (PCP) who coordinates your care. You typically need referrals to see specialists, and care outside the network is usually not covered except in emergencies.',
  },
  ppo: {
    name: 'PPO (Preferred Provider Organization)',
    description: 'PPO plans offer more flexibility. You can see any provider, but you\'ll pay less when using in-network providers. Referrals are not required to see specialists.',
  },
  epo: {
    name: 'EPO (Exclusive Provider Organization)',
    description: 'EPO plans combine aspects of HMO and PPO plans. You must use providers within the network (except emergencies), but typically don\'t need referrals for specialists.',
  },
};
