import { OrgPolicy } from '@/lib/adminStorage';

/**
 * Base organization policies
 * These can be overridden by admin via localStorage
 */
export const orgPolicies: OrgPolicy[] = [
  {
    id: 'policy-001',
    category: 'Governance',
    title: 'Code of Conduct',
    body: 'All members of the Alliance of Independent Physicians are expected to maintain the highest standards of professional conduct. This includes:\n\n• Treating all patients with dignity, respect, and compassion\n• Maintaining confidentiality of patient information\n• Adhering to all applicable medical ethics guidelines\n• Engaging in honest and transparent communication\n• Respecting the professional boundaries of colleagues\n\nViolations of the Code of Conduct may result in disciplinary action, including suspension or termination of membership.',
  },
  {
    id: 'policy-002',
    category: 'Governance',
    title: 'Conflict of Interest Policy',
    body: 'Members must disclose any potential conflicts of interest that may arise in the course of their professional activities. This includes:\n\n• Financial relationships with pharmaceutical companies, medical device manufacturers, or other healthcare entities\n• Ownership interests in healthcare facilities or services\n• Consulting arrangements or speaking engagements\n• Research funding or grants\n\nAll disclosures must be made in writing to the Board of Trustees. The Board will review each disclosure and determine appropriate management strategies.',
  },
  {
    id: 'policy-003',
    category: 'Governance',
    title: 'Governance Bylaws',
    body: 'The Alliance of Independent Physicians operates under a set of bylaws that govern:\n\n• Board composition and election procedures\n• Meeting schedules and quorum requirements\n• Decision-making processes\n• Financial management and reporting\n• Amendment procedures\n\nAll members are entitled to review the complete bylaws document. The current bylaws are effective February 4, 2026, and may be amended by a two-thirds majority vote of the Board of Trustees.\n\n[Download the complete bylaws document](/policies/governance-bylaws.pdf)',
  },
  {
    id: 'policy-004',
    category: 'Compliance',
    title: 'Privacy & Data Handling',
    body: 'The Alliance is committed to protecting the privacy and security of member and patient data. Our data handling practices comply with:\n\n• Health Insurance Portability and Accountability Act (HIPAA)\n• General Data Protection Regulation (GDPR) where applicable\n• State and federal privacy laws\n\nKey principles:\n\n• Data is collected only for legitimate business purposes\n• Access to data is restricted to authorized personnel\n• Data is encrypted both in transit and at rest\n• Regular security audits are conducted\n• Breach notification procedures are in place\n\nMembers must also comply with all applicable privacy regulations in their own practices.',
  },
  {
    id: 'policy-005',
    category: 'Compliance',
    title: 'Patient Safety Commitment',
    body: 'Patient safety is our highest priority. All members commit to:\n\n• Following evidence-based medical practices\n• Maintaining current medical licenses and certifications\n• Participating in continuing medical education\n• Reporting adverse events through appropriate channels\n• Engaging in quality improvement initiatives\n\nMembers are expected to maintain professional liability insurance and adhere to all applicable standards of care. The Alliance provides resources and support for quality improvement efforts.',
  },
  {
    id: 'policy-006',
    category: 'Operations',
    title: 'Meeting Minutes Policy',
    body: 'All official meetings of the Board of Trustees and committees are documented through meeting minutes. The minutes include:\n\n• Date, time, and location of the meeting\n• List of attendees\n• Agenda items discussed\n• Decisions made and votes taken\n• Action items assigned\n\nMinutes are reviewed and approved at the subsequent meeting. Approved minutes are made available to all members within 30 days of approval. Confidential matters may be documented separately.',
  },
  {
    id: 'policy-007',
    category: 'Membership',
    title: 'Membership Eligibility',
    body: 'To be eligible for membership in the Alliance of Independent Physicians, applicants must:\n\n• Hold a valid medical license in good standing\n• Be board-certified in their specialty (or board-eligible for recent graduates)\n• Practice independently or in a small group practice\n• Agree to abide by the Code of Conduct and all Alliance policies\n• Complete the application process and pay applicable fees\n\nMembership applications are reviewed by the Membership Committee. Decisions are typically made within 30 days of receiving a complete application.',
  },
  {
    id: 'policy-008',
    category: 'Membership',
    title: 'Membership Dues and Fees',
    body: 'Membership dues are structured as follows:\n\n• Basic Plan: $99/month or $990/year\n• Professional Plan: $199/month or $1,990/year\n• Premier Plan: Custom pricing (contact for details)\n\nDues are billed according to the selected billing cycle. Members may upgrade or downgrade their plan at any time, with prorated adjustments. Late payments may result in suspension of membership benefits. Refunds are available within 30 days of initial membership for new members who are not satisfied with the service.',
  },
  {
    id: 'policy-009',
    category: 'Membership',
    title: 'Member Benefits and Services',
    body: 'Membership benefits vary by plan level:\n\nBasic Plan includes:\n• Directory listing\n• Basic profile management\n• Referral network access\n• Community forum access\n• Email support\n\nProfessional Plan includes all Basic benefits plus:\n• Advanced profile customization\n• Priority referral matching\n• Appointment request system\n• Review management tools\n• Priority support\n• Advanced analytics\n\nPremier Plan includes all Professional benefits plus:\n• Multi-provider account management\n• Custom integration support\n• Dedicated account manager\n• Custom reporting\n• White-label options\n• API access\n\nAdditional services may be available for an additional fee.',
  },
  {
    id: 'policy-010',
    category: 'Privacy',
    title: 'Member Directory Privacy',
    body: 'Member directory listings are publicly accessible and include:\n\n• Name and credentials\n• Specialty\n• Practice location(s)\n• Contact information (as provided by member)\n• Professional bio (optional)\n\nMembers can control which information is displayed in their directory listing through their dashboard. The Alliance respects member privacy preferences and will not share contact information without explicit consent, except as required by law.',
  },
  {
    id: 'policy-011',
    category: 'Privacy',
    title: 'Data Retention and Deletion',
    body: 'The Alliance retains member data for as long as membership is active and for a reasonable period thereafter for legal and business purposes. Upon termination of membership:\n\n• Member profile is removed from public directory\n• Access to member portal is revoked\n• Data is archived for 7 years (as required by law)\n• After 7 years, data may be permanently deleted\n\nMembers may request deletion of their data at any time, subject to legal retention requirements. Requests must be made in writing to the Privacy Officer.',
  },
];
