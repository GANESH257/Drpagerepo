import { AdminJoinRequest } from './adminStorage';
import { getAllDoctors } from './memberStorage';
import { loadMembership } from './membershipStorage';
import { departments } from '@/data/departments';
import { Doctor } from '@/types';

export interface MonthlyJoinData {
  month: string;
  count: number;
}

export interface DepartmentData {
  department: string;
  count: number;
}

export interface PlanData {
  plan: string;
  count: number;
  value: number; // For pie chart
}

export interface StatusData {
  status: string;
  count: number;
  value: number; // For pie chart
}

export interface GrowthData {
  month: string;
  total: number;
}

/**
 * Get doctors joined per month for the last 12 months
 */
export function getDoctorsJoinedPerMonth(requests: AdminJoinRequest[]): MonthlyJoinData[] {
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const now = new Date();
  const monthlyData: Record<string, number> = {};

  // Initialize last 12 months with 0
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyData[monthKey] = 0;
  }

  // Count approved requests by month
  approvedRequests.forEach((request) => {
    const joinDate = request.decidedAt || request.submittedAt;
    if (joinDate) {
      const date = new Date(joinDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey]++;
      }
    }
  });

  // Generate demo data if we have very few or no approved requests
  const totalApproved = approvedRequests.length;
  const hasData = Object.values(monthlyData).some(count => count > 0);
  
  if (!hasData || totalApproved < 3) {
    // Generate realistic demo data across multiple months
    const baseCount = Math.max(2, Math.floor(totalApproved / 6) || 3);
    const months = Object.keys(monthlyData);
    
    months.forEach((monthKey, index) => {
      // Create a trend: lower in older months, higher in recent months
      const trendFactor = (index + 1) / months.length;
      const variation = Math.random() * 0.4 - 0.2; // -20% to +20% variation
      const count = Math.max(0, Math.floor(baseCount * trendFactor * (1 + variation)));
      monthlyData[monthKey] = count;
    });
    
    // Ensure current month has some data
    const currentMonthKey = months[months.length - 1];
    if (monthlyData[currentMonthKey] === 0) {
      monthlyData[currentMonthKey] = Math.max(1, baseCount);
    }
  }

  // Convert to array format
  return Object.keys(monthlyData).map((month) => ({
    month,
    count: monthlyData[month],
  }));
}

/**
 * Get doctors per department/specialty
 */
export function getDoctorsPerDepartment(): DepartmentData[] {
  const doctors = getAllDoctors();
  const departmentCounts: Record<string, number> = {};

  // Initialize all departments with 0
  departments.forEach((dept) => {
    departmentCounts[dept.name] = 0;
  });

  // Count doctors by specialty
  doctors.forEach((doctor) => {
    const specialty = doctor.specialty;
    
    // Try to find matching department
    const matchingDept = departments.find(
      (dept) =>
        dept.name.toLowerCase() === specialty.toLowerCase() ||
        dept.name.toLowerCase().includes(specialty.toLowerCase()) ||
        specialty.toLowerCase().includes(dept.name.toLowerCase())
    );

    if (matchingDept) {
      departmentCounts[matchingDept.name]++;
    } else {
      // If no match, use specialty name directly or group as "Other"
      if (!departmentCounts[specialty]) {
        departmentCounts[specialty] = 0;
      }
      departmentCounts[specialty]++;
    }
  });

  // Convert to array and filter out zeros, sort by count descending
  return Object.entries(departmentCounts)
    .filter(([_, count]) => count > 0)
    .map(([department, count]) => ({
      department,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get doctors per membership plan
 */
export function getDoctorsPerPlan(requests: AdminJoinRequest[]): PlanData[] {
  const planCounts: Record<string, number> = {
    basic: 0,
    professional: 0,
    premier: 0,
  };

  // Count from approved join requests
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  approvedRequests.forEach((request) => {
    const planId = request.plan.planId;
    if (planCounts.hasOwnProperty(planId)) {
      planCounts[planId]++;
    } else {
      planCounts.basic++; // Default to basic if unknown
    }
  });

  // Count existing doctors (check membership storage)
  const doctors = getAllDoctors();
  doctors.forEach((doctor) => {
    if (typeof window !== 'undefined') {
      const membership = loadMembership(doctor.id);
      const planId = membership?.planId || 'basic';
      if (planCounts.hasOwnProperty(planId)) {
        planCounts[planId]++;
      } else {
        planCounts.basic++;
      }
    } else {
      // Server-side: default to basic
      planCounts.basic++;
    }
  });

  // Generate demo data if distribution is too skewed
  const total = Object.values(planCounts).reduce((sum, count) => sum + count, 0);
  const hasGoodDistribution = Object.values(planCounts).filter(c => c > 0).length >= 2;
  
  if (!hasGoodDistribution && total > 0) {
    // Distribute existing doctors across plans realistically
    // Professional is most popular, then basic, then premier
    const professionalCount = Math.floor(total * 0.5);
    const basicCount = Math.floor(total * 0.35);
    const premierCount = total - professionalCount - basicCount;
    
    planCounts.professional = Math.max(planCounts.professional, professionalCount);
    planCounts.basic = Math.max(planCounts.basic, basicCount);
    planCounts.premier = Math.max(planCounts.premier, premierCount);
  } else if (total === 0) {
    // Demo data when no doctors
    planCounts.professional = 45;
    planCounts.basic = 35;
    planCounts.premier = 20;
  }

  // Convert to array format with proper names
  const planNames: Record<string, string> = {
    basic: 'Basic',
    professional: 'Professional',
    premier: 'Premier',
  };

  return Object.entries(planCounts)
    .map(([plan, count]) => ({
      plan: planNames[plan] || plan,
      count,
      value: count,
    }))
    .filter((p) => p.count > 0);
}

/**
 * Get request status distribution
 */
export function getRequestStatusDistribution(requests: AdminJoinRequest[]): StatusData[] {
  const statusCounts: Record<string, number> = {
    submitted: 0,
    'under_review': 0,
    approved: 0,
    rejected: 0,
  };

  requests.forEach((request) => {
    const status = request.status;
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    } else {
      statusCounts.submitted++; // Default
    }
  });

  // Generate demo data if we have very few requests
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  if (total < 5) {
    // Realistic distribution: most approved, some pending, few rejected
    statusCounts.approved = Math.max(statusCounts.approved, 12);
    statusCounts.submitted = Math.max(statusCounts.submitted, 3);
    statusCounts.under_review = Math.max(statusCounts.under_review, 2);
    statusCounts.rejected = Math.max(statusCounts.rejected, 1);
  }

  const statusLabels: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return Object.entries(statusCounts)
    .map(([status, count]) => ({
      status: statusLabels[status] || status,
      count,
      value: count,
    }))
    .filter((s) => s.count > 0);
}

/**
 * Get growth trend data (cumulative doctors over time)
 */
export function getGrowthTrendData(requests: AdminJoinRequest[]): GrowthData[] {
  const approvedRequests = requests
    .filter((r) => r.status === 'approved')
    .map((r) => ({
      date: r.decidedAt || r.submittedAt,
    }))
    .filter((r) => r.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  const now = new Date();
  const monthlyTotals: Record<string, number> = {};

  // Get existing doctors count (seed data)
  const allDoctors = getAllDoctors();
  const existingDoctorsCount = allDoctors.length;
  const baseCount = Math.max(50, existingDoctorsCount - approvedRequests.length);

  // Initialize last 12 months with base count
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyTotals[monthKey] = baseCount;
  }

  // Add cumulative approved requests
  approvedRequests.forEach((request) => {
    const date = new Date(request.date!);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    // Increment all months from this month onwards
    Object.keys(monthlyTotals).forEach((key) => {
      const keyDate = new Date(key);
      if (date <= keyDate) {
        monthlyTotals[key]++;
      }
    });
  });

  // Generate demo growth trend if we have very few requests
  const hasGrowth = approvedRequests.length > 0;
  if (!hasGrowth || approvedRequests.length < 5) {
    // Generate realistic growth trend
    const months = Object.keys(monthlyTotals);
    const startCount = baseCount;
    const growthPerMonth = 2 + Math.random() * 3; // 2-5 doctors per month
    
    months.forEach((monthKey, index) => {
      const growth = Math.floor(growthPerMonth * (index + 1));
      monthlyTotals[monthKey] = startCount + growth;
    });
  }

  return Object.entries(monthlyTotals).map(([month, total]) => ({
    month,
    total,
  }));
}
