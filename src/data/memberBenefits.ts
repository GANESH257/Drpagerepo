export interface MemberBenefit {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export const memberBenefits: MemberBenefit[] = [
  {
    id: '1',
    title: 'Referral Network',
    description: 'Get referrals from a trusted network of Board Certified Specialists. Connect with specialists and coordinate patient care seamlessly.',
    icon: 'Users',
  },
  {
    id: '2',
    title: 'Patient Visibility',
    description: 'Increase visibility to patients searching by specialty and location. Appear in directory listings and specialty searches.',
    icon: 'Eye',
  },
  {
    id: '3',
    title: 'Profile Management',
    description: 'Manage your profile, locations, and accepted insurance plans through an intuitive dashboard. Keep information current and accurate. (Phase 2)',
    icon: 'User',
  },
  {
    id: '4',
    title: 'Appointment Requests',
    description: 'Receive appointment requests online directly through the platform. Streamline scheduling and reduce administrative burden. (Phase 2)',
    icon: 'Calendar',
  },
  {
    id: '5',
    title: 'Reputation & Reviews',
    description: 'Build credibility with verified reviews. Showcase patient satisfaction and professional reputation to attract new patients. (Phase 3)',
    icon: 'Star',
  },
  {
    id: '6',
    title: 'Community Connection',
    description: 'Connect with the Board Certified Specialists community. Participate in events, share knowledge, and collaborate with peers.',
    icon: 'Users2',
  },
  {
    id: '7',
    title: 'Research Visibility',
    description: 'Share publications and research visibility. Highlight your expertise and contribute to medical knowledge.',
    icon: 'FileText',
  },
  {
    id: '8',
    title: 'Continuing Education',
    description: 'Participate in events and continuing education opportunities. Stay current with medical advances and best practices. (Future)',
    icon: 'GraduationCap',
  },
];
