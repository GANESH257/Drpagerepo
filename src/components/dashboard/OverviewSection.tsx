'use client';

import { useRouter } from 'next/navigation';
import { User, MapPin, CreditCard, Calendar, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doctor } from '@/types';
import { loadAppointmentRequests, loadReferrals } from '@/lib/doctorStorage';
import { useEffect, useState } from 'react';
import { AppointmentRequest, Referral } from '@/types';
import { MonthlyAppointmentsChart } from './MonthlyAppointmentsChart';
import { MonthlyReferralsChart } from './MonthlyReferralsChart';

interface OverviewSectionProps {
  doctor: Doctor;
}

export function OverviewSection({ doctor }: OverviewSectionProps) {
  const router = useRouter();
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const requests = loadAppointmentRequests(doctor.id);
    const refs = loadReferrals(doctor.id);
    setAppointmentRequests(requests);
    setReferrals(refs);
  }, [doctor.id]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (): number => {
    const fields = [
      doctor.firstName,
      doctor.lastName,
      doctor.fullName,
      doctor.specialty,
      doctor.bio,
      doctor.credentials,
      doctor.medicalSchool,
      doctor.residency,
      doctor.locations.length > 0,
      doctor.insurance.length > 0,
      doctor.boardCertifications && doctor.boardCertifications.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const newAppointments = appointmentRequests.filter((r) => r.status === 'New').length;
  const thisMonthReferrals = referrals.filter((r) => {
    const refDate = new Date(r.date);
    const now = new Date();
    return refDate.getMonth() === now.getMonth() && refDate.getFullYear() === now.getFullYear();
  }).length;

  const quickActions = [
    {
      label: 'Edit Profile',
      href: '/doctor/dashboard/profile',
      icon: User,
      description: 'Update your professional information',
    },
    {
      label: 'Manage Locations',
      href: '/doctor/dashboard/locations',
      icon: MapPin,
      description: 'Add or update practice locations',
    },
    {
      label: 'Insurance & Services',
      href: '/doctor/dashboard/insurance',
      icon: CreditCard,
      description: 'Manage insurance and services',
    },
    {
      label: 'Appointments',
      href: '/doctor/dashboard/appointments',
      icon: Calendar,
      description: 'View appointment requests',
    },
    {
      label: 'Referrals',
      href: '/doctor/dashboard/referrals',
      icon: Users,
      description: 'Track referrals',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F5FA8]">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">
          Welcome back, {doctor.firstName}. Here's a summary of your dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Profile Completion</CardTitle>
            <User className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F5FA8]">{profileCompletion}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {profileCompletion < 100 ? 'Complete your profile to improve visibility' : 'Profile complete'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">New Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F5FA8]">{newAppointments}</div>
            <p className="text-xs text-gray-500 mt-1">
              Pending appointment requests
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Referrals This Month</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F5FA8]">{thisMonthReferrals}</div>
            <p className="text-xs text-gray-500 mt-1">
              Referrals from network physicians
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Verification Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {doctor.verified ? (
              <>
                <Badge className="bg-[#0F5FA8] text-white border-[#0F5FA8]">Verified</Badge>
                <p className="text-xs text-gray-500 mt-2">
                  Your profile is verified
                </p>
              </>
            ) : (
              <>
                <Badge className="bg-gray-100 text-gray-700 border-gray-300">Pending</Badge>
                <p className="text-xs text-gray-500 mt-2">
                  Verification in progress
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <MonthlyAppointmentsChart appointments={appointmentRequests} />
        <MonthlyReferralsChart referrals={referrals} />
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#0F5FA8]">Quick Actions</CardTitle>
          <CardDescription className="text-gray-600">Jump to common tasks and sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto flex-col items-start justify-start p-4 hover:bg-[#0F5FA8]/5 border-gray-200 hover:border-[#0F5FA8]/30"
                  onClick={() => router.push(action.href)}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[#0F5FA8]" />
                      <span className="font-semibold text-gray-900">{action.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="mt-2 text-left text-sm text-gray-600">
                    {action.description}
                  </p>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
