import { JoinRequest } from '@/types';
import { AdminJoinRequest } from '@/lib/adminStorage';

/**
 * Mock join requests for seeding admin portal
 */
export const mockJoinRequests: AdminJoinRequest[] = [
  {
    id: 'req-mock-001',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'submitted',
    applicant: {
      email: 'dr.smith@example.com',
      fullName: 'Dr. Sarah Smith, M.D.',
      credentials: 'M.D.',
      specialty: 'Cardiology',
      phone: '(555) 123-4567',
      city: 'New York',
      state: 'NY',
      practiceName: 'Smith Cardiology Associates',
      website: 'https://smithcardiology.com',
      messageToAdmin: 'Looking forward to joining the network and connecting with other independent physicians.',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    paymentDetails: {
      cardName: 'Sarah Smith',
      billingZip: '10001',
    },
  },
  {
    id: 'req-mock-002',
    submittedAt: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 2 months ago
    status: 'approved',
    applicant: {
      email: 'dr.johnson@example.com',
      fullName: 'Dr. Michael Johnson, D.O.',
      credentials: 'D.O.',
      specialty: 'Family Medicine',
      phone: '(555) 234-5678',
      city: 'Los Angeles',
      state: 'CA',
      practiceName: 'Johnson Family Practice',
    },
    plan: {
      planId: 'basic',
      billingCycle: 'monthly',
    },
    paymentMethod: 'paypal',
    decidedAt: new Date(Date.now() - 1.8 * 30 * 24 * 60 * 60 * 1000).toISOString(), // Approved 1.8 months ago
    decidedBy: 'admin@aip.com',
    notes: 'Approved - credentials verified',
  },
  {
    id: 'req-mock-003',
    submittedAt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
    status: 'rejected',
    applicant: {
      email: 'dr.williams@example.com',
      fullName: 'Dr. Robert Williams, M.D.',
      credentials: 'M.D.',
      specialty: 'Pediatrics',
      phone: '(555) 345-6789',
      city: 'Chicago',
      state: 'IL',
      practiceName: 'Williams Pediatric Clinic',
      website: 'https://williamspediatrics.com',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    paymentDetails: {
      cardName: 'Robert Williams',
      billingZip: '60601',
    },
    decidedAt: new Date(Date.now() - 2.8 * 30 * 24 * 60 * 60 * 1000).toISOString(), // Rejected 2.8 months ago
    decidedBy: 'admin@aip.com',
    rejectionReason: 'Incomplete application - missing required documentation',
  },
  {
    id: 'req-mock-004',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'submitted',
    applicant: {
      email: 'dr.brown@example.com',
      fullName: 'Dr. Emily Brown, M.D.',
      credentials: 'M.D.',
      specialty: 'Dermatology',
      phone: '(555) 456-7890',
      city: 'Houston',
      state: 'TX',
      practiceName: 'Brown Dermatology Center',
      messageToAdmin: 'Interested in the Professional plan features.',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'monthly',
    },
    paymentMethod: 'paypal',
  },
  {
    id: 'req-mock-005',
    submittedAt: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 4 months ago
    status: 'approved',
    applicant: {
      email: 'dr.davis@example.com',
      fullName: 'Dr. James Davis, M.D.',
      credentials: 'M.D.',
      specialty: 'Orthopedics',
      phone: '(555) 567-8901',
      city: 'Phoenix',
      state: 'AZ',
      practiceName: 'Davis Orthopedic Group',
      website: 'https://davisortho.com',
    },
    plan: {
      planId: 'premier',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    paymentDetails: {
      cardName: 'James Davis',
      billingZip: '85001',
    },
    decidedAt: new Date(Date.now() - 3.8 * 30 * 24 * 60 * 60 * 1000).toISOString(), // Approved 3.8 months ago
    decidedBy: 'admin@aip.com',
    notes: 'Approved - Premier plan access granted',
  },
  {
    id: 'req-mock-006',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'submitted',
    applicant: {
      email: 'dr.miller@example.com',
      fullName: 'Dr. Patricia Miller, M.D.',
      credentials: 'M.D.',
      specialty: 'Internal Medicine',
      phone: '(555) 678-9012',
      city: 'Philadelphia',
      state: 'PA',
    },
    plan: {
      planId: 'basic',
      billingCycle: 'monthly',
    },
    paymentMethod: 'card',
    paymentDetails: {
      cardName: 'Patricia Miller',
      billingZip: '19101',
    },
  },
  {
    id: 'req-mock-007',
    submittedAt: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 5 months ago
    status: 'rejected',
    applicant: {
      email: 'dr.wilson@example.com',
      fullName: 'Dr. David Wilson, M.D.',
      credentials: 'M.D.',
      specialty: 'Neurology',
      phone: '(555) 789-0123',
      city: 'San Antonio',
      state: 'TX',
      practiceName: 'Wilson Neurology Associates',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'annual',
    },
    paymentMethod: 'paypal',
    decidedAt: new Date(Date.now() - 4.8 * 30 * 24 * 60 * 60 * 1000).toISOString(), // Rejected 4.8 months ago
    decidedBy: 'admin@aip.com',
    rejectionReason: 'Application does not meet current membership criteria',
  },
  {
    id: 'req-mock-008',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    status: 'submitted',
    applicant: {
      email: 'dr.moore@example.com',
      fullName: 'Dr. Jennifer Moore, D.O.',
      credentials: 'D.O.',
      specialty: 'Obstetrics & Gynecology',
      phone: '(555) 890-1234',
      city: 'San Diego',
      state: 'CA',
      practiceName: 'Moore Women\'s Health',
      website: 'https://moorewomenshealth.com',
      messageToAdmin: 'Excited to join the network and expand my practice connections.',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    paymentDetails: {
      cardName: 'Jennifer Moore',
      billingZip: '92101',
    },
  },
  {
    id: 'req-mock-009',
    submittedAt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    status: 'approved',
    applicant: {
      email: 'dr.taylor@example.com',
      fullName: 'Dr. Christopher Taylor, M.D.',
      credentials: 'M.D.',
      specialty: 'Cardiology',
      phone: '(555) 901-2345',
      city: 'Miami',
      state: 'FL',
      practiceName: 'Taylor Heart Institute',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    decidedAt: new Date(Date.now() - 5.8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
  },
  {
    id: 'req-mock-010',
    submittedAt: new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 7 months ago
    status: 'approved',
    applicant: {
      email: 'dr.anderson@example.com',
      fullName: 'Dr. Lisa Anderson, M.D.',
      credentials: 'M.D.',
      specialty: 'Internal Medicine',
      phone: '(555) 012-3456',
      city: 'Seattle',
      state: 'WA',
      practiceName: 'Anderson Internal Medicine',
    },
    plan: {
      planId: 'basic',
      billingCycle: 'annual',
    },
    paymentMethod: 'paypal',
    decidedAt: new Date(Date.now() - 6.8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
  },
  {
    id: 'req-mock-011',
    submittedAt: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 8 months ago
    status: 'approved',
    applicant: {
      email: 'dr.thomas@example.com',
      fullName: 'Dr. Mark Thomas, M.D.',
      credentials: 'M.D.',
      specialty: 'Orthopedic Spine',
      phone: '(555) 123-4567',
      city: 'Denver',
      state: 'CO',
      practiceName: 'Thomas Spine Center',
    },
    plan: {
      planId: 'premier',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    decidedAt: new Date(Date.now() - 7.8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
  },
  {
    id: 'req-mock-012',
    submittedAt: new Date(Date.now() - 9 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 9 months ago
    status: 'approved',
    applicant: {
      email: 'dr.jackson@example.com',
      fullName: 'Dr. Susan Jackson, D.O.',
      credentials: 'D.O.',
      specialty: 'Family Practice',
      phone: '(555) 234-5678',
      city: 'Atlanta',
      state: 'GA',
      practiceName: 'Jackson Family Care',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'monthly',
    },
    paymentMethod: 'card',
    decidedAt: new Date(Date.now() - 8.8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
  },
  {
    id: 'req-mock-013',
    submittedAt: new Date(Date.now() - 10 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 10 months ago
    status: 'approved',
    applicant: {
      email: 'dr.white@example.com',
      fullName: 'Dr. Daniel White, M.D.',
      credentials: 'M.D.',
      specialty: 'Dermatology',
      phone: '(555) 345-6789',
      city: 'Boston',
      state: 'MA',
      practiceName: 'White Dermatology',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'annual',
    },
    paymentMethod: 'paypal',
    decidedAt: new Date(Date.now() - 9.8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
  },
  {
    id: 'req-mock-014',
    submittedAt: new Date(Date.now() - 11 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 11 months ago
    status: 'approved',
    applicant: {
      email: 'dr.harris@example.com',
      fullName: 'Dr. Michelle Harris, M.D.',
      credentials: 'M.D.',
      specialty: 'Endocrinology',
      phone: '(555) 456-7890',
      city: 'Portland',
      state: 'OR',
      practiceName: 'Harris Endocrine Clinic',
    },
    plan: {
      planId: 'basic',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    decidedAt: new Date(Date.now() - 10.8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
  },
  {
    id: 'req-mock-015',
    submittedAt: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    status: 'approved',
    applicant: {
      email: 'dr.martin@example.com',
      fullName: 'Dr. Kevin Martin, M.D.',
      credentials: 'M.D.',
      specialty: 'Gastroenterology',
      phone: '(555) 567-8901',
      city: 'Dallas',
      state: 'TX',
      practiceName: 'Martin GI Associates',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'annual',
    },
    paymentMethod: 'card',
    decidedAt: new Date(Date.now() - 0.8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
  },
  {
    id: 'req-mock-016',
    submittedAt: new Date(Date.now() - 1.5 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 months ago
    status: 'under_review',
    applicant: {
      email: 'dr.garcia@example.com',
      fullName: 'Dr. Maria Garcia, M.D.',
      credentials: 'M.D.',
      specialty: 'Psychiatry',
      phone: '(555) 678-9012',
      city: 'San Francisco',
      state: 'CA',
      practiceName: 'Garcia Mental Health',
    },
    plan: {
      planId: 'professional',
      billingCycle: 'monthly',
    },
    paymentMethod: 'card',
  },
];

/**
 * Seed mock join requests if localStorage is empty
 */
export function seedMockJoinRequests(): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem('aip_join_requests');
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem('aip_join_requests', JSON.stringify(mockJoinRequests));
    }
  } catch (error) {
    console.error('Error seeding mock join requests:', error);
  }
}
