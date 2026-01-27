export interface HomeFAQ {
  question: string;
  answer: string;
}

export const homeFAQ: HomeFAQ[] = [
  {
    question: 'How do I find a doctor?',
    answer: 'Use our directory to search by specialty, location, or name. Filter by insurance plan to find doctors who accept your coverage. Each profile includes credentials, locations, accepted insurance, and patient reviews to help you make an informed decision.',
  },
  {
    question: 'How do referrals work?',
    answer: 'Physicians in our network can refer patients to specialists within the network. The referral system streamlines coordination and ensures patients connect with the right specialists. This feature is currently in development and will be available in Phase 2.',
  },
  {
    question: 'How do booking and connection requests work?',
    answer: 'Patients can request appointments through doctor profiles. Physicians can receive and manage these requests through their dashboard. The system facilitates coordination between patients and providers, with real-time updates on request status. (Phase 2)',
  },
  {
    question: 'Are physician profiles verified?',
    answer: 'Yes, all physicians in our network undergo verification of credentials, board certifications, and practice information. Verified profiles display a badge, giving patients confidence in their choice of provider.',
  },
  {
    question: 'How do members update their profile?',
    answer: 'Physician members can update their profile, locations, accepted insurance, and practice information through the doctor dashboard. Changes are typically reflected within 24-48 hours after verification.',
  },
  {
    question: 'What is your privacy policy?',
    answer: 'We take privacy seriously. All information submitted through our platform is handled according to HIPAA guidelines. We do not share personal information with third parties without consent. Patient data is protected, and physician information is used solely for directory purposes. See our Privacy Policy page for full details.',
  },
];
