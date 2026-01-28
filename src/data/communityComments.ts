export interface CommunityComment {
  id: string;
  author: string;
  role: 'patient' | 'physician';
  comment: string;
  rating?: number; // For patient reviews
  doctorName?: string; // For patient reviews
  doctorSpecialty?: string; // For patient reviews
  specialty?: string; // For physician comments
  date?: string;
}

export const communityComments: CommunityComment[] = [
  // Patient reviews
  {
    id: '1',
    author: 'Sarah M.',
    role: 'patient',
    comment: 'Dr. Williams was incredibly thorough and took time to explain everything. The referral process was smooth, and I felt well-cared for throughout.',
    rating: 5,
    doctorName: 'Lauren Williams, M.D.',
    doctorSpecialty: 'Rheumatology',
    date: '2026-01-22',
  },
  {
    id: '2',
    author: 'Michael R.',
    role: 'patient',
    comment: 'Found the perfect specialist through this network. The directory made it easy to find someone who accepts my insurance and is close to home.',
    rating: 5,
    doctorName: 'Jonathan Rivera, M.D.',
    doctorSpecialty: 'Gastroenterology',
    date: '2026-01-20',
  },
  {
    id: '3',
    author: 'Jennifer L.',
    role: 'patient',
    comment: 'The verified profiles gave me confidence in choosing a doctor. Great experience from start to finish.',
    rating: 5,
    doctorName: 'Heather Rogers, M.D.',
    doctorSpecialty: 'Gastroenterology',
    date: '2026-01-18',
  },
  // Physician member comments
  {
    id: '4',
    author: 'Dr. Phillip Brick',
    role: 'physician',
    specialty: 'Internal Medicine',
    comment: 'The referral network helps me connect patients with specialists faster. It\'s streamlined my coordination efforts significantly.',
    date: '2026-01-16',
  },
  {
    id: '5',
    author: 'Dr. Hashim Raza',
    role: 'physician',
    specialty: 'Cardiology',
    comment: 'Being part of this network has increased my patient visibility. The directory makes it easy for patients to find me based on their needs.',
    date: '2026-01-14',
  },
  {
    id: '6',
    author: 'Dr. Sarah Johnson',
    role: 'physician',
    specialty: 'Family Practice',
    comment: 'The community aspect is valuable. I\'ve connected with colleagues for consultations and referrals, which benefits my patients.',
    date: '2026-01-12',
  },
  {
    id: '7',
    author: 'Dr. Michael Chen',
    role: 'physician',
    specialty: 'Endocrinology',
    comment: 'The platform makes it easy to keep my profile updated. Patients can see my credentials, locations, and accepted insurance all in one place.',
    date: '2026-01-10',
  },
];
