export interface PatientBenefit {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  link?: string;
  linkText?: string;
  size: 'small' | 'medium' | 'large';
  accentColor: 'teal' | 'blue';
}

export interface PatientReview {
  id: string;
  rating: number;
  comment: string;
  patientName: string;
  date: string;
  verified: boolean;
}

export interface PatientFAQ {
  question: string;
  answer: string;
}

export const patientBenefits: PatientBenefit[] = [
  {
    id: 'direct-doctor-relationship',
    title: 'Direct Doctor Relationship',
    description: 'Your care is decided by you and your doctor, not a hospital administrator.',
    icon: 'Heart',
    size: 'medium',
    accentColor: 'teal',
  },
  {
    id: 'more-time',
    title: 'More Time with Your Physician',
    description: 'Independent doctors often have more flexible schedules, allowing for longer, more thorough appointments.',
    icon: 'Clock',
    size: 'medium',
    accentColor: 'blue',
  },
  {
    id: 'lower-costs',
    title: 'Lower Costs',
    description: 'Private practices often have lower overhead than large hospital systems, which can translate to more affordable care.',
    icon: 'DollarSign',
    size: 'medium',
    accentColor: 'teal',
  },
];

export const patientReviews: PatientReview[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Dr. Smith took the time to listen to all my concerns. The office staff was friendly and scheduling was easy.',
    patientName: 'Sarah M.',
    date: '2 weeks ago',
    verified: true,
  },
  {
    id: '2',
    rating: 5,
    comment: "Finally found a doctor who doesn't rush through appointments. The care I received was exceptional.",
    patientName: 'Michael R.',
    date: '1 month ago',
    verified: true,
  },
  {
    id: '3',
    rating: 4.5,
    comment: 'Great experience overall. The doctor was knowledgeable and the facility was clean and modern.',
    patientName: 'Jennifer L.',
    date: '3 weeks ago',
    verified: true,
  },
  {
    id: '4',
    rating: 5,
    comment: 'I appreciate the transparency in pricing. No surprise bills, and the quality of care was outstanding.',
    patientName: 'David K.',
    date: '1 week ago',
    verified: true,
  },
  {
    id: '5',
    rating: 5,
    comment: 'Same-day appointment availability was a lifesaver. The doctor was thorough and caring.',
    patientName: 'Emily T.',
    date: '2 months ago',
    verified: true,
  },
  {
    id: '6',
    rating: 4.5,
    comment: 'The independent practice model really shows in the personalized attention. Highly recommend.',
    patientName: 'Robert P.',
    date: '3 weeks ago',
    verified: false,
  },
];

export const patientFAQ: PatientFAQ[] = [
  {
    question: 'Is there a cost to patients to use this directory?',
    answer: 'No. The AIP directory is completely free for patients. There is no fee to search for physicians, view profiles, or submit a connection request. Membership fees apply only to physicians who join the network, not to patients seeking care.',
  },
  {
    question: 'Are the physicians in this network board-certified?',
    answer: 'Yes. All physicians listed in the AIP directory are independently practicing, board-certified specialists. Each profile displays the physician\'s credentials, certifications, and years of experience so you can make an informed decision before reaching out.',
  },
  {
    question: 'What does "independent physician" mean for my care?',
    answer: 'An independent physician owns and operates their own practice rather than working for a hospital system or corporate group. This means your doctor answers to you — not to a hospital board or insurance company — which often results in longer appointments, more personalized attention, and decisions made in your best interest.',
  },
  {
    question: 'Can I use this directory if I don\'t have insurance?',
    answer: 'Yes. Many AIP member physicians offer self-pay options and transparent pricing for uninsured or underinsured patients. You can contact any practice directly through their profile to ask about cash-pay rates and payment plans before scheduling.',
  },
  {
    question: 'How do I know if a physician is currently accepting new patients?',
    answer: 'Each physician profile indicates whether the practice is currently accepting new patients. If the profile does not specify, you can send a connection request or contact the practice directly using the contact information listed on their profile page.',
  },
];

// Extract insurance list from common insurance providers
export const insuranceList: string[] = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealthcare',
  'Medicare',
  'Medicaid',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'AARP',
  'Tricare',
  'Oscar Health',
];
