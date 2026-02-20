'use client';

import { useRouter } from 'next/navigation';
import { User, MapPin, CreditCard, Calendar, Users, CheckCircle2, ArrowRight, TrendingUp, Activity, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doctor } from '@/types';
import { loadAppointmentRequests, loadReferrals } from '@/lib/doctorStorage';
import { useEffect, useState } from 'react';
import { AppointmentRequest, Referral } from '@/types';
import { MonthlyAppointmentsChart } from './MonthlyAppointmentsChart';
import { MonthlyReferralsChart } from './MonthlyReferralsChart';
import { cn } from '@/lib/utils';

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
      color: 'teal',
    },
    {
      label: 'Manage Locations',
      href: '/doctor/dashboard/locations',
      icon: MapPin,
      description: 'Add or update practice locations',
      color: 'blue',
    },
    {
      label: 'Insurance & Services',
      href: '/doctor/dashboard/insurance',
      icon: CreditCard,
      description: 'Manage insurance and services',
      color: 'teal',
    },
    {
      label: 'Appointments',
      href: '/doctor/dashboard/appointments',
      icon: Calendar,
      description: 'View appointment requests',
      color: 'blue',
    },
    {
      label: 'Referrals',
      href: '/doctor/dashboard/referrals',
      icon: Users,
      description: 'Track referrals',
      color: 'teal',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-dark-blue to-brand-dark-blue/80 p-5 md:p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="mt-2 text-blue-100 max-w-2xl text-base md:text-lg">
            Welcome back, <span className="font-semibold text-white">Dr. {doctor.lastName}</span>.
            Your practice is growing. Here's what's happening today.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="absolute -bottom-12 right-12 h-32 w-32 rounded-full bg-brand-teal/10 blur-2xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Profile Completion */}
        <Card className="group relative overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50" />
          <div className="absolute top-0 h-1 w-full bg-brand-teal" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Profile Completion</CardTitle>
            <div className="rounded-full bg-brand-teal/10 p-2 text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors duration-300">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{profileCompletion}%</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-teal transition-all duration-1000 ease-out"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {profileCompletion < 100 ? 'Complete your profile to stand out' : 'Excellent! Your profile is complete'}
            </p>
          </CardContent>
        </Card>

        {/* New Appointments */}
        <Card className="group relative overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50" />
          <div className="absolute top-0 h-1 w-full bg-brand-dark-blue" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Pending Requests</CardTitle>
            <div className="rounded-full bg-brand-dark-blue/10 p-2 text-brand-dark-blue group-hover:bg-brand-dark-blue group-hover:text-white transition-colors duration-300">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{newAppointments}</span>
              <span className="text-sm font-medium text-blue-600">new</span>
            </div>
            <p className="mt-6 text-xs text-gray-500">
              Appointments awaiting your review
            </p>
          </CardContent>
        </Card>

        {/* Referrals */}
        <Card className="group relative overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50" />
          <div className="absolute top-0 h-1 w-full bg-brand-teal" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Recent Referrals</CardTitle>
            <div className="rounded-full bg-brand-teal/10 p-2 text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors duration-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{thisMonthReferrals}</span>
              <span className="text-sm font-medium text-teal-600">MTD</span>
            </div>
            <p className="mt-6 text-xs text-gray-500">
              Referrals focused this month
            </p>
          </CardContent>
        </Card>

        {/* Verification */}
        <Card className="group relative overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50" />
          <div className="absolute top-0 h-1 w-full bg-brand-dark-blue" />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Status</CardTitle>
            <div className={cn(
              "rounded-full p-2 transition-colors duration-300",
              doctor.verified ? "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white" : "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
            )}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            {doctor.verified ? (
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold text-green-600">Fully Verified</span>
                <p className="text-xs text-gray-500">You have full access to all features</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold text-orange-600">Under Review</span>
                <p className="text-xs text-gray-500">Verification in progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="transform transition-all duration-500 hover:scale-[1.01]">
          <MonthlyAppointmentsChart appointments={appointmentRequests} />
        </div>
        <div className="transform transition-all duration-500 hover:scale-[1.01]">
          <MonthlyReferralsChart referrals={referrals} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="overflow-hidden border-none shadow-lg rounded-3xl">
        <CardHeader className="bg-gray-50/50 pb-6 pt-6 px-5 md:pb-8 md:pt-8 md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-brand-dark-blue">Quick Actions</CardTitle>
              <CardDescription className="mt-1 text-xs md:text-sm text-gray-500">Jump to common tasks and management tools</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className={cn(
                    "group relative h-auto flex-col items-start justify-start p-4 md:p-6 transition-all duration-300 border-gray-100 shadow-sm",
                    "hover:-translate-y-1 hover:shadow-md",
                    action.color === 'teal' ? "hover:border-brand-teal/30 hover:bg-brand-teal/5" : "hover:border-brand-dark-blue/30 hover:bg-brand-dark-blue/5"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => router.push(action.href)}
                >
                  <div className="flex w-full items-center justify-between mb-3 md:mb-4">
                    <div className={cn(
                      "rounded-xl p-2 md:p-3 transition-colors duration-300",
                      action.color === 'teal' ? "bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white" : "bg-brand-dark-blue/10 text-brand-dark-blue group-hover:bg-brand-dark-blue group-hover:text-white"
                    )}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="rounded-full bg-gray-50 p-1 text-gray-400 group-hover:text-gray-900 group-hover:bg-white transition-all duration-300">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="font-bold text-base md:text-lg text-gray-900 leading-tight">{action.label}</span>
                    <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
