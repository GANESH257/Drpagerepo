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
    id: 'top-rated',
    title: 'Top-Rated Care',
    description: 'Access elite independent physicians who answer to you, not a hospital board. Consistently rated higher in patient satisfaction.',
    icon: 'Award',
    link: '/doctors?sort=rating-desc',
    linkText: 'See the difference',
    size: 'large',
    accentColor: 'teal',
  },
  {
    id: 'less-wait',
    title: 'Less Wait',
    description: 'Same-day appointments often available. 2 days avg vs 24 days.',
    icon: 'Clock',
    size: 'small',
    accentColor: 'blue',
  },
  {
    id: 'personal-connection',
    title: 'Personal Connection',
    description: 'Build a long-term relationship with a doctor who knows your history.',
    icon: 'Heart',
    size: 'medium',
    accentColor: 'teal',
  },
  {
    id: 'transparent-pricing',
    title: 'Transparent Pricing. No Surprises.',
    description: 'Independent practices often cost significantly less than hospital-owned facilities for the same services.',
    icon: 'DollarSign',
    link: '/contact-us',
    linkText: 'Learn About Costs',
    size: 'large',
    accentColor: 'blue',
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
    question: 'How do I find the right specialist?',
    answer: 'Use our search tool to filter by specialty, location, and insurance. Each doctor profile includes credentials, patient reviews, accepted insurance plans, and practice information to help you make an informed decision.',
  },
  {
    question: 'Can I filter by insurance?',
    answer: 'Yes, you can filter doctors by insurance plan. Use the insurance filter in the search bar or on the doctor directory page to find physicians who accept your specific insurance plan.',
  },
  {
    question: 'How do booking requests work?',
    answer: 'Patients can request appointments through doctor profiles. Physicians receive and manage these requests through their dashboard. The system facilitates coordination between patients and providers with real-time updates on request status. (This feature is currently in development and will be available in Phase 2.)',
  },
  {
    question: 'Are reviews verified?',
    answer: 'Yes, reviews marked with a "Verified Visit" badge are from patients who have confirmed appointments with the physician. This helps ensure authentic feedback from real patients.',
  },
  {
    question: 'How do I contact a clinic?',
    answer: 'Each doctor profile includes contact information including phone numbers and office locations. You can also use the contact form on our contact page for general inquiries.',
  },
  {
    question: 'Do doctors offer telehealth?',
    answer: 'Many doctors in our network offer telehealth appointments. Check individual doctor profiles for telehealth availability and scheduling options. (Telehealth availability varies by physician and specialty.)',
  },
  {
    question: 'What makes independent physicians different?',
    answer: 'Independent physicians typically offer more personalized care, shorter wait times, and often more transparent pricing. They answer to their patients rather than hospital boards, allowing for more flexible and patient-focused care decisions.',
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
