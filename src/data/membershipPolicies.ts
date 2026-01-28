import { MembershipPolicy } from '@/types';

export const membershipPolicies: MembershipPolicy[] = [
  {
    category: 'Eligibility & Verification',
    items: [
      {
        id: '1',
        title: 'Physician Eligibility',
        body: 'Membership is open to licensed physicians, nurse practitioners, and physician assistants practicing independently or in group settings. All members must provide proof of current licensure and board certification where applicable.',
      },
      {
        id: '2',
        title: 'Verification Process',
        body: 'New members undergo a verification process to confirm credentials, licensure status, and practice information. Verification typically takes 3-5 business days. Members receive verified status badges upon completion.',
      },
      {
        id: '3',
        title: 'Group Practice Membership',
        body: 'Group practices may enroll multiple providers under a single membership. Each provider receives individual profile access while sharing practice-level benefits and resources.',
      },
    ],
  },
  {
    category: 'Renewals & Billing',
    items: [
      {
        id: '4',
        title: 'Membership Term',
        body: 'Memberships are available on monthly or annual billing cycles. Annual memberships include a discount equivalent to two months free. Memberships automatically renew unless cancelled.',
      },
      {
        id: '5',
        title: 'Payment Methods',
        body: 'Payment processing will be enabled in Phase 2. Currently, membership enrollment is free during our beta period. Future payment methods will include credit card, ACH, and invoice options for annual plans.',
      },
      {
        id: '6',
        title: 'Renewal Notifications',
        body: 'Members receive email notifications 30 days before renewal dates. Members can update payment methods, change plans, or cancel membership through their dashboard.',
      },
    ],
  },
  {
    category: 'Profile & Directory Guidelines',
    items: [
      {
        id: '7',
        title: 'Profile Accuracy',
        body: 'Members are responsible for maintaining accurate profile information, including locations, specialties, insurance acceptance, and contact details. Inaccurate information may result in profile suspension.',
      },
      {
        id: '8',
        title: 'Directory Listing Standards',
        body: 'All directory listings must comply with professional standards and applicable regulations. Prohibited content includes false claims, unsubstantiated testimonials, and misleading information.',
      },
      {
        id: '9',
        title: 'Profile Updates',
        body: 'Members can update profiles at any time through the dashboard. Significant changes (e.g., new locations, specialty additions) may require re-verification. Updates are typically reflected within 24-48 hours.',
      },
    ],
  },
  {
    category: 'Conduct & Community Standards',
    items: [
      {
        id: '10',
        title: 'Professional Conduct',
        body: 'Members must maintain professional conduct in all interactions through the platform. This includes respectful communication, ethical referral practices, and adherence to medical ethics standards.',
      },
      {
        id: '11',
        title: 'Referral Practices',
        body: 'Referrals should be made based on patient needs and provider expertise. Members must not engage in inappropriate referral arrangements, kickbacks, or conflicts of interest.',
      },
      {
        id: '12',
        title: 'Community Participation',
        body: 'Active participation in community forums and events is encouraged but not required. Members should contribute constructively and respect diverse perspectives within the physician community.',
      },
    ],
  },
  {
    category: 'Data & Privacy',
    items: [
      {
        id: '13',
        title: 'Data Protection',
        body: 'We protect member data in accordance with HIPAA guidelines and applicable privacy laws. Member information is used solely for platform operations and is not sold to third parties.',
      },
      {
        id: '14',
        title: 'Patient Information',
        body: 'Members must handle patient information shared through the platform in compliance with HIPAA. The platform provides secure communication channels, but members are responsible for maintaining patient privacy.',
      },
      {
        id: '15',
        title: 'Data Access & Portability',
        body: 'Members can access and download their profile data at any time through the dashboard. Upon membership termination, members may request data export within 30 days.',
      },
    ],
  },
  {
    category: 'Cancellations/Termination',
    items: [
      {
        id: '16',
        title: 'Member Cancellation',
        body: 'Members may cancel membership at any time through their dashboard or by contacting support. Cancellations take effect at the end of the current billing period. No refunds for partial periods.',
      },
      {
        id: '17',
        title: 'Termination for Cause',
        body: 'Membership may be terminated for violations of policies, professional misconduct, or failure to maintain required credentials. Termination decisions are made by the board and are subject to appeal.',
      },
      {
        id: '18',
        title: 'Post-Termination Access',
        body: 'Upon termination, members lose access to member-only features and dashboard. Profile listings may remain visible in the public directory for up to 90 days unless removal is requested.',
      },
    ],
  },
];
