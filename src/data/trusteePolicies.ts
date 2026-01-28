import { TrusteePolicy } from '@/types';

// TODO: Replace placeholder PDFs with actual policy documents
// PDFs should be placed in /public/policies/ directory
export const trusteePolicies: TrusteePolicy[] = [
  {
    id: '1',
    title: 'Code of Conduct',
    description: 'Establishes ethical standards and professional conduct expectations for all board members and organization participants.',
    category: 'Governance',
    filePath: '/policies/code-of-conduct.pdf',
    fileSize: '245 KB',
  },
  {
    id: '2',
    title: 'Conflict of Interest Policy',
    description: 'Defines procedures for identifying, disclosing, and managing potential conflicts of interest among board members.',
    category: 'Governance',
    filePath: '/policies/conflict-of-interest.pdf',
    fileSize: '189 KB',
  },
  {
    id: '3',
    title: 'Privacy & Data Handling',
    description: 'Outlines how the organization collects, uses, stores, and protects member and patient data in compliance with applicable regulations.',
    category: 'Compliance',
    filePath: '/policies/privacy-data-handling.pdf',
    fileSize: '312 KB',
  },
  {
    id: '4',
    title: 'Patient Safety Commitment',
    description: 'Formal statement of the organization\'s commitment to maintaining the highest standards of patient safety and quality care.',
    category: 'Compliance',
    filePath: '/policies/patient-safety-commitment.pdf',
    fileSize: '156 KB',
  },
  {
    id: '5',
    title: 'Meeting Minutes Policy',
    description: 'Establishes procedures for documenting, reviewing, and distributing board meeting minutes to ensure transparency and accountability.',
    category: 'Operations',
    filePath: '/policies/meeting-minutes-policy.pdf',
    fileSize: '128 KB',
  },
  {
    id: '6',
    title: 'Governance Bylaws',
    description: 'Comprehensive bylaws governing the structure, operations, and decision-making processes of the Board of Trustees.',
    category: 'Governance',
    filePath: '/policies/governance-bylaws.pdf',
    fileSize: '478 KB',
  },
];
