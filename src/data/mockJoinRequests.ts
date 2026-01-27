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
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
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
    decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    decidedBy: 'admin@aip.com',
    notes: 'Approved - credentials verified',
  },
  {
    id: 'req-mock-003',
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
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
    decidedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
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
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
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
    decidedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
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
    submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
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
    decidedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
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
